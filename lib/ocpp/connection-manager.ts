import { WebSocket } from "ws";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import {
  CALL,
  CALL_RESULT,
  CALL_ERROR,
  type OcppMessage,
  type OcppCall,
  type BootNotificationRequest,
  type BootNotificationResponse,
  type HeartbeatResponse,
  type StatusNotificationRequest,
  type AuthorizeRequest,
  type AuthorizeResponse,
  type TransactionEventRequest,
  type TransactionEventResponse,
  type RequestStartTransactionRequest,
  type RequestStopTransactionRequest,
} from "./types";
import path from "path";

console.log("Initializing OCPP Connection Manager...");
console.log(
  "Database URL:",
  process.env.DATABASE_URL ? "Provided" : "Not Provided",
);

// 1. Garanta que o dotenv aponte para o local correto (raiz do projeto)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// 2. Validação de segurança para evitar que o erro pare o processo de forma genérica
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "ERRO DE CONFIGURAÇÃO: A variável de ambiente DATABASE_URL não foi encontrada. " +
      "Verifique se o seu arquivo .env existe e se a variável está definida.",
  );
}

const sql = neon(databaseUrl);

// Store connected charge stations
interface ConnectedStation {
  ws: WebSocket;
  identity: string;
  stationId: string | null;
  lastHeartbeat: Date;
  pendingCalls: Map<
    string,
    {
      resolve: (response: Record<string, unknown>) => void;
      reject: (error: Error) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  >;
}

class OcppConnectionManager {
  private connections: Map<string, ConnectedStation> = new Map();

  getConnection(identity: string): ConnectedStation | undefined {
    return this.connections.get(identity);
  }

  getAllConnections(): Map<string, ConnectedStation> {
    return this.connections;
  }

  isConnected(identity: string): boolean {
    const conn = this.connections.get(identity);
    return !!conn && conn.ws.readyState === WebSocket.OPEN;
  }

  async handleConnection(ws: WebSocket, identity: string) {
    console.log(`[OCPP] Station connected: ${identity}`);

    // Find or create station record
    const stations = await sql`
      SELECT id FROM charge_stations WHERE identity = ${identity}
    `;

    let stationId: string | null = null;
    if (stations.length > 0) {
      stationId = stations[0].id;
      await sql`
        UPDATE charge_stations 
        SET "isOnline" = true, "updatedAt" = NOW()
        WHERE id = ${stationId}
      `;
    }

    const connection: ConnectedStation = {
      ws,
      identity,
      stationId,
      lastHeartbeat: new Date(),
      pendingCalls: new Map(),
    };

    this.connections.set(identity, connection);

    ws.on("message", async (data) => {
      try {
        const message: OcppMessage = JSON.parse(data.toString());
        await this.handleMessage(identity, message);
      } catch (error) {
        console.error(`[OCPP] Message parse error from ${identity}:`, error);
      }
    });

    ws.on("close", async () => {
      console.log(`[OCPP] Station disconnected: ${identity}`);

      // Clear pending calls
      const conn = this.connections.get(identity);
      if (conn) {
        conn.pendingCalls.forEach((pending) => {
          clearTimeout(pending.timeout);
          pending.reject(new Error("Connection closed"));
        });
      }

      this.connections.delete(identity);

      if (stationId) {
        await sql`
          UPDATE charge_stations 
          SET "isOnline" = false, "updatedAt" = NOW()
          WHERE id = ${stationId}
        `;
      }
    });

    ws.on("error", (error) => {
      console.error(`[OCPP] WebSocket error from ${identity}:`, error);
    });
  }

  private async handleMessage(identity: string, message: OcppMessage) {
    const messageType = message[0];
    const connection = this.connections.get(identity);
    if (!connection) return;

    if (messageType === CALL) {
      // CS -> CSMS request
      const [, messageId, action, payload] = message as [
        number,
        string,
        string,
        Record<string, unknown>,
      ];
      console.log(`[OCPP] ${identity} -> ${action}`);

      await this.logMessage(
        connection.stationId,
        messageId,
        action,
        "incoming",
        payload,
      );

      const response = await this.handleAction(identity, action, payload);

      const result = [CALL_RESULT, messageId, response];
      connection.ws.send(JSON.stringify(result));

      await this.logMessage(
        connection.stationId,
        messageId,
        action,
        "outgoing",
        response,
      );
    } else if (messageType === CALL_RESULT) {
      // Response to our request
      const [, messageId, payload] = message as [
        number,
        string,
        Record<string, unknown>,
      ];
      const pending = connection.pendingCalls.get(messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve(payload);
        connection.pendingCalls.delete(messageId);
      }
    } else if (messageType === CALL_ERROR) {
      // Error response to our request
      const [, messageId, errorCode, errorDescription] = message as [
        number,
        string,
        string,
        string,
        Record<string, unknown>,
      ];
      const pending = connection.pendingCalls.get(messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.reject(new Error(`${errorCode}: ${errorDescription}`));
        connection.pendingCalls.delete(messageId);
      }
    }
  }

  private async handleAction(
    identity: string,
    action: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const connection = this.connections.get(identity);

    switch (action) {
      case "BootNotification":
        return this.handleBootNotification(
          identity,
          payload as unknown as BootNotificationRequest,
        );

      case "Heartbeat":
        return this.handleHeartbeat(identity);

      case "StatusNotification":
        return this.handleStatusNotification(
          identity,
          payload as unknown as StatusNotificationRequest,
        );

      case "Authorize":
        return this.handleAuthorize(payload as unknown as AuthorizeRequest);

      case "TransactionEvent":
        return this.handleTransactionEvent(
          identity,
          payload as unknown as TransactionEventRequest,
        ) as Promise<Record<string, unknown>>;

      default:
        console.log(`[OCPP] Unhandled action from ${identity}: ${action}`);
        void connection; // suppress unused variable
        return {};
    }
  }

  private async handleBootNotification(
    identity: string,
    payload: BootNotificationRequest,
  ): Promise<BootNotificationResponse> {
    const { chargingStation } = payload;
    const connection = this.connections.get(identity);

    // Update station info in database
    if (connection?.stationId) {
      await sql`
        UPDATE charge_stations 
        SET 
          vendor = ${chargingStation.vendorName},
          model = ${chargingStation.model},
          "serialNumber" = ${chargingStation.serialNumber ?? null},
          "firmwareVersion" = ${chargingStation.firmwareVersion ?? null},
          "registrationStatus" = 'Accepted',
          "isOnline" = true,
          "lastBootNotification" = NOW(),
          "updatedAt" = NOW()
        WHERE id = ${connection.stationId}
      `;
    }

    return {
      currentTime: new Date().toISOString(),
      interval: 60, // Heartbeat interval in seconds
      status: "Accepted",
    };
  }

  private async handleHeartbeat(identity: string): Promise<HeartbeatResponse> {
    const connection = this.connections.get(identity);
    if (connection) {
      connection.lastHeartbeat = new Date();
      if (connection.stationId) {
        await sql`
          UPDATE charge_stations 
          SET "lastHeartbeat" = NOW(), "isOnline" = true, "updatedAt" = NOW()
          WHERE id = ${connection.stationId}
        `;
      }
    }

    return {
      currentTime: new Date().toISOString(),
    };
  }

  private async handleStatusNotification(
    identity: string,
    payload: StatusNotificationRequest,
  ): Promise<Record<string, unknown>> {
    const connection = this.connections.get(identity);
    if (connection?.stationId) {
      // Update EVSE status
      await sql`
        UPDATE evses 
        SET status = ${payload.connectorStatus}, "updatedAt" = NOW()
        WHERE "chargeStationId" = ${connection.stationId} 
          AND "evseId" = ${payload.evseId}
      `;

      // Update connector status
      await sql`
        UPDATE connectors 
        SET status = ${payload.connectorStatus}, "updatedAt" = NOW()
        WHERE "evseId" = (
          SELECT id FROM evses 
          WHERE "chargeStationId" = ${connection.stationId} 
            AND "evseId" = ${payload.evseId}
        )
        AND "connectorId" = ${payload.connectorId}
      `;
    }

    return {}; // StatusNotification has empty response
  }

  private async handleAuthorize(
    payload: AuthorizeRequest,
  ): Promise<AuthorizeResponse> {
    // For now, accept all authorizations
    void payload;
    return {
      idTokenInfo: {
        status: "Accepted",
      },
    };
  }

  private async handleTransactionEvent(
    identity: string,
    payload: TransactionEventRequest,
  ): Promise<TransactionEventResponse> {
    const connection = this.connections.get(identity);
    if (!connection?.stationId) return {};

    const { eventType, transactionInfo, evse, meterValue } = payload;

    if (eventType === "Started") {
      await sql`
        INSERT INTO transactions (id, "transactionId", "chargeStationId", "evseId", "connectorId", "idToken", status, "startedAt", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid()::text,
          ${transactionInfo.transactionId},
          ${connection.stationId},
          ${evse ? String(evse.id) : null},
          ${evse?.connectorId ? String(evse.connectorId) : null},
          ${payload.idToken?.idToken ?? null},
          'Started',
          ${payload.timestamp},
          NOW(),
          NOW()
        )
        ON CONFLICT ("transactionId") DO NOTHING
      `;

      // Update EVSE to Occupied
      if (evse) {
        await sql`
          UPDATE evses SET status = 'Occupied', "updatedAt" = NOW()
          WHERE "chargeStationId" = ${connection.stationId} AND "evseId" = ${evse.id}
        `;
      }
    } else if (eventType === "Updated") {
      const energyValue = meterValue?.[0]?.sampledValue?.find(
        (sv) => sv.measurand === "Energy.Active.Import.Register",
      )?.value;

      if (energyValue !== undefined) {
        await sql`
          UPDATE transactions 
          SET "energyDelivered" = ${energyValue}, status = 'Updated', "updatedAt" = NOW()
          WHERE "transactionId" = ${transactionInfo.transactionId}
        `;
      }
    } else if (eventType === "Ended") {
      const energyValue = meterValue?.[0]?.sampledValue?.find(
        (sv) => sv.measurand === "Energy.Active.Import.Register",
      )?.value;

      await sql`
        UPDATE transactions 
        SET 
          status = 'Ended', 
          "stoppedAt" = ${payload.timestamp},
          "meterStop" = ${energyValue ?? null},
          "energyDelivered" = ${energyValue ?? 0},
          reason = ${transactionInfo.stoppedReason ?? null},
          "updatedAt" = NOW()
        WHERE "transactionId" = ${transactionInfo.transactionId}
      `;

      // Update EVSE back to Available
      if (evse) {
        await sql`
          UPDATE evses SET status = 'Available', "updatedAt" = NOW()
          WHERE "chargeStationId" = ${connection.stationId} AND "evseId" = ${evse.id}
        `;
      }
    }

    return {};
  }

  // Send command to a charge station (CSMS -> CS)
  async sendCommand(
    identity: string,
    action: string,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const connection = this.connections.get(identity);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      throw new Error(`Station ${identity} is not connected`);
    }

    const messageId = crypto.randomUUID();
    const message = [CALL, messageId, action, payload];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        connection.pendingCalls.delete(messageId);
        reject(new Error(`Command ${action} timed out for ${identity}`));
      }, 30000); // 30 second timeout

      connection.pendingCalls.set(messageId, { resolve, reject, timeout });
      connection.ws.send(JSON.stringify(message));

      this.logMessage(
        connection.stationId,
        messageId,
        action,
        "outgoing",
        payload,
      ).catch(console.error);
    });
  }

  async requestStartTransaction(
    identity: string,
    evseId: number,
  ): Promise<Record<string, unknown>> {
    const payload: RequestStartTransactionRequest = {
      idToken: {
        idToken: "CSMS-REMOTE-START",
        type: "Central",
      },
      evseId,
    };
    return this.sendCommand(
      identity,
      "RequestStartTransaction",
      payload as unknown as Record<string, unknown>,
    );
  }

  async requestStopTransaction(
    identity: string,
    transactionId: string,
  ): Promise<Record<string, unknown>> {
    const payload: RequestStopTransactionRequest = {
      transactionId,
    };
    return this.sendCommand(
      identity,
      "RequestStopTransaction",
      payload as unknown as Record<string, unknown>,
    );
  }

  private async logMessage(
    stationId: string | null,
    messageId: string,
    action: string,
    direction: string,
    payload: unknown,
  ) {
    if (!stationId) return;
    try {
      await sql`
        INSERT INTO ocpp_messages (id, "chargeStationId", "messageId", action, direction, payload, "createdAt")
        VALUES (gen_random_uuid()::text, ${stationId}, ${messageId}, ${action}, ${direction}, ${JSON.stringify(payload)}::jsonb, NOW())
      `;
    } catch (error) {
      console.error("[OCPP] Failed to log message:", error);
    }
  }
}

// Singleton instance
export const ocppManager = new OcppConnectionManager();
