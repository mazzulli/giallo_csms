import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { ocppManager } from "@/lib/ocpp/connection-manager";

const prisma = new PrismaClient();

console.log("Searching for charge stations...");
console.log(
  "Database URL:",
  process.env.DATABASE_URL ? "Provided" : "Not Provided",
);

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(
    "ENTREI.... Buscando estações para o usuário:",
    session.user.email,
  );

  try {
    // Fetch all charge stations with their EVSEs and connectors
    const stations = await prisma.chargeStation.findMany({
      include: {
        evses: {
          include: {
            connectors: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const total = stations.length;
    const online = stations.filter((s) => s.status === "ONLINE").length;
    const offline = stations.filter((s) => s.status === "OFFLINE").length;
    const faulted = stations.filter((s) => s.status === "FAULTED").length;
    const charging = stations.filter((s) =>
      s.evses?.some((e) => e.status === "OCCUPIED"),
    ).length;

    return NextResponse.json({
      stations,
      total,
      online,
      offline,
      faulted,
      charging,
    });
  } catch (error) {
    console.error("Fetch stations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  // if (!session?.user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const body = await request.json();
    const { stationId, identity, command, params } = body;

    // Validate required fields
    if (!identity || !command) {
      return NextResponse.json(
        { error: "Missing required fields: identity and command" },
        { status: 400 },
      );
    }

    // Check if station exists and user has permission
    if (stationId) {
      const station = await prisma.chargeStation.findUnique({
        where: { id: stationId },
      });
      if (!station) {
        return NextResponse.json(
          { error: "Station not found" },
          { status: 404 },
        );
      }
    }

    // Check if station is connected
    if (!ocppManager.isConnected(identity)) {
      return NextResponse.json(
        { error: "Station is not connected" },
        { status: 503 },
      );
    }

    let result: Record<string, unknown>;

    // Route commands to appropriate handler
    switch (command) {
      case "RequestStartTransaction":
        if (!params?.evseId) {
          return NextResponse.json(
            { error: "RequestStartTransaction requires evseId parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.requestStartTransaction(
          identity,
          params.evseId,
        );
        break;

      case "RequestStopTransaction":
        if (!params?.transactionId) {
          return NextResponse.json(
            {
              error: "RequestStopTransaction requires transactionId parameter",
            },
            { status: 400 },
          );
        }
        result = await ocppManager.requestStopTransaction(
          identity,
          params.transactionId,
        );
        break;

      case "Reset":
        result = await ocppManager.reset(identity, params?.type ?? "Soft");
        break;

      case "ChangeAvailability":
        if (params?.operational === undefined) {
          return NextResponse.json(
            { error: "ChangeAvailability requires operational parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.changeAvailability(
          identity,
          params.operational,
          params.evseId,
        );
        break;

      case "UnlockConnector":
        result = await ocppManager.unlockConnector(
          identity,
          params?.evseId,
          params?.connectorId,
        );
        break;

      case "GetVariables":
        if (!params?.getVariableData) {
          return NextResponse.json(
            { error: "GetVariables requires getVariableData parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.getVariables(
          identity,
          params.getVariableData,
        );
        break;

      case "SetVariables":
        if (!params?.setVariableData) {
          return NextResponse.json(
            { error: "SetVariables requires setVariableData parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.setVariables(
          identity,
          params.setVariableData,
        );
        break;

      case "TriggerMessage":
        if (!params?.requestedMessage) {
          return NextResponse.json(
            { error: "TriggerMessage requires requestedMessage parameter" },
            { status: 400 },
          );
        }
        result = await ocppManager.triggerMessage(
          identity,
          params.requestedMessage,
          params?.evseId,
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown command: ${command}` },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      command,
      result,
    });
  } catch (error) {
    console.error("Station command error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
