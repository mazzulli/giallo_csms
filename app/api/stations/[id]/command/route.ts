import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
import { ocppManager } from "@/lib/ocpp/connection-manager";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  // if (!session?.user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const { id: stationId } = await params;
    const body = await request.json();
    const {
      action,
      command,
      params: commandParams,
      evseId,
      transactionId,
    } = body;

    // Map 'action' to 'command' if action is provided
    let finalCommand = command;
    let finalParams: Record<string, unknown> = commandParams || {};

    if (action) {
      if (action === "start") {
        finalCommand = "RequestStartTransaction";
        finalParams = { evseId: evseId ?? 1 };
      } else if (action === "stop") {
        finalCommand = "RequestStopTransaction";
        finalParams = { transactionId };
      }
    }

    console.log(
      `[COMMAND] Station: ${stationId}, Command: ${finalCommand}, Params:`,
      finalParams,
    );

    // Validate required fields
    if (!finalCommand) {
      console.log("[COMMAND] Error: Missing command field");
      return NextResponse.json(
        { error: "Missing required field: command or action" },
        { status: 400 },
      );
    }

    // Get station by ID to find its identity
    const stations = await sql`
      SELECT id, identity FROM charge_stations WHERE id = ${stationId}
    `;

    if (stations.length === 0) {
      console.log(`[COMMAND] Station not found: ${stationId}`);
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const identity = stations[0].identity;
    console.log(`[COMMAND] Station identity retrieved: ${identity}`);

    // Check if station is connected
    const isConnected = ocppManager.isConnected(identity);
    console.log(
      `[COMMAND] Station connected check for identity "${identity}": ${isConnected}`,
    );

    // Debug: show all connected stations
    const allConnections = ocppManager.getAllConnections();
    console.log(
      `[COMMAND] All connected stations:`,
      Array.from(allConnections.keys()),
    );

    if (!isConnected) {
      console.log(
        `[COMMAND] Error: Station ${identity} is not connected to CSMS`,
      );
      return NextResponse.json(
        { error: "Station is not connected" },
        { status: 503 },
      );
    }

    let result: Record<string, unknown>;

    // Route commands to appropriate handler
    switch (finalCommand) {
      case "RequestStartTransaction":
        if (!finalParams?.evseId) {
          return NextResponse.json(
            { error: "RequestStartTransaction requires evseId parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.requestStartTransaction(
          identity,
          finalParams.evseId as number,
        );
        console.log(`[COMMAND] RequestStartTransaction result:`, result);
        break;

      case "RequestStopTransaction":
        if (!finalParams?.transactionId) {
          return NextResponse.json(
            {
              error: "RequestStopTransaction requires transactionId parameter",
            },
            { status: 400 },
          );
        }
        result = await ocppManager.requestStopTransaction(
          identity,
          finalParams.transactionId as string,
        );
        break;

      case "Reset":
        result = await ocppManager.reset(
          identity,
          (finalParams?.type as "Hard" | "Soft") ?? "Soft",
        );
        break;

      case "ChangeAvailability":
        if (finalParams?.operational === undefined) {
          return NextResponse.json(
            { error: "ChangeAvailability requires operational parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.changeAvailability(
          identity,
          finalParams.operational as boolean,
          finalParams.evseId as number | undefined,
        );
        break;

      case "UnlockConnector":
        result = await ocppManager.unlockConnector(
          identity,
          finalParams?.evseId as number | undefined,
          finalParams?.connectorId as number | undefined,
        );
        break;

      case "GetVariables":
        if (!finalParams?.getVariableData) {
          return NextResponse.json(
            { error: "GetVariables requires getVariableData parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.getVariables(
          identity,
          finalParams.getVariableData as Array<{
            attributeType?: "Actual" | "Target" | "MinSet" | "MaxSet";
            component?: { name: string; instance?: string };
            variable?: { name: string; instance?: string };
          }>,
        );
        break;

      case "SetVariables":
        if (!finalParams?.setVariableData) {
          return NextResponse.json(
            { error: "SetVariables requires setVariableData parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.setVariables(
          identity,
          finalParams.setVariableData as Array<{
            attributeType?: "Target" | "MinSet" | "MaxSet";
            attributeValue: string;
            component: { name: string; instance?: string };
            variable: { name: string; instance?: string };
          }>,
        );
        break;

      case "TriggerMessage":
        if (!finalParams?.requestedMessage) {
          return NextResponse.json(
            { error: "TriggerMessage requires requestedMessage parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.triggerMessage(
          identity,
          finalParams.requestedMessage as
            | "BootNotification"
            | "LogStatusNotification"
            | "FirmwareStatusNotification"
            | "Heartbeat"
            | "MeterValues"
            | "SignChargingStationCertificate"
            | "StatusNotification",
          finalParams?.evseId as number | undefined,
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown command: ${finalCommand}` },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      command: finalCommand,
      result,
    });
  } catch (error) {
    console.error("Station command error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
