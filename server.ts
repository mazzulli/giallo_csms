import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { ocppManager } from "./lib/ocpp/connection-manager";

// Freeze the singleton immediately to prevent re-initialization during HMR
Object.freeze(ocppManager);
Object.freeze(ocppManager.constructor.prototype);

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log(`[SERVER] Initializing custom HTTP server...`);
  console.log(`[SERVER] OCPP Manager initialized and frozen`);

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Create WebSocket server for OCPP
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    console.log(`[UPGRADE] Upgrade request for: ${request.url}`);
    const { pathname } = parse(request.url!);

    // Handle OCPP WebSocket connections at /ocpp/{identity}
    if (pathname?.startsWith("/ocpp/")) {
      const identity = pathname.replace("/ocpp/", "");

      if (!identity) {
        socket.destroy();
        return;
      }

      // Verify OCPP subprotocol
      const protocols = request.headers["sec-websocket-protocol"];
      console.log(
        `[OCPP Server] Connection attempt - Identity: ${identity}, Protocols: ${protocols}`,
      );

      const hasOcppProtocol = protocols?.includes("ocpp2.0.1");

      wss.handleUpgrade(request, socket, head, (ws) => {
        console.log(
          `[OCPP Server] New connection: ${identity} (protocol: ${hasOcppProtocol ? "ocpp2.0.1" : "none"})`,
        );
        wss.emit("connection", ws, request);

        // Hand off to the OCPP connection manager
        ocppManager.handleConnection(ws, identity);
      });
    } else {
      // For non-OCPP WebSocket requests (like HMR), let Next.js handle it
      // Don't destroy the socket - let it pass through
    }
  });

  server.listen(port, hostname, () => {
    console.log(`[SERVER] ✅ CSMS Server ready on http://${hostname}:${port}`);
    console.log(
      `[SERVER] ✅ OCPP 2.0.1 WebSocket endpoint: ws://${hostname}:${port}/ocpp/{identity}`,
    );
  });
});
