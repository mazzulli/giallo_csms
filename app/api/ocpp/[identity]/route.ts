import { NextRequest, NextResponse } from "next/server"

// OCPP 2.0.1 WebSocket endpoint info
// The actual WebSocket handling is done via the custom server (server.ts)
// This endpoint provides info about the OCPP endpoint for the CS

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identity: string }> }
) {
  const { identity } = await params

  // Check if this is a WebSocket upgrade request
  const upgradeHeader = request.headers.get("upgrade")
  if (upgradeHeader === "websocket") {
    // WebSocket connections should go through ws://host/ocpp/{identity}
    // This is handled by the custom server
    return new NextResponse("WebSocket upgrade should be handled by the OCPP server", {
      status: 426,
      headers: {
        "Upgrade": "websocket",
        "Connection": "Upgrade",
      },
    })
  }

  return NextResponse.json({
    endpoint: `/ocpp/${identity}`,
    protocol: "ocpp2.0.1",
    identity,
    info: "Connect via WebSocket to ws://host/ocpp/{identity} with subprotocol ocpp2.0.1",
  })
}
