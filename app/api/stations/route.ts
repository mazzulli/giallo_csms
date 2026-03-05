import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch all charge stations with their EVSEs and connectors
    const stations = await sql`
      SELECT 
        cs.*,
        json_agg(
          json_build_object(
            'id', e.id,
            'evseId', e."evseId",
            'chargeStationId', e."chargeStationId",
            'status', e.status,
            'connectors', (
              SELECT json_agg(
                json_build_object(
                  'id', c.id,
                  'connectorId', c."connectorId",
                  'evseId', c."evseId",
                  'type', c.type,
                  'status', c.status
                )
              )
              FROM connectors c
              WHERE c."evseId" = e.id
            )
          )
        ) FILTER (WHERE e.id IS NOT NULL) AS evses
      FROM charge_stations cs
      LEFT JOIN evses e ON e."chargeStationId" = cs.id
      GROUP BY cs.id
      ORDER BY cs."createdAt" DESC
    `

    const total = stations.length
    const online = stations.filter((s: Record<string, unknown>) => s.isOnline).length
    const offline = stations.filter((s: Record<string, unknown>) => !s.isOnline).length
    const faulted = stations.filter((s: Record<string, unknown>) =>
      (s.evses as Array<{ status: string }> | null)?.some((e: { status: string }) => e.status === "Faulted")
    ).length
    const charging = stations.filter((s: Record<string, unknown>) =>
      (s.evses as Array<{ status: string }> | null)?.some((e: { status: string }) => e.status === "Occupied")
    ).length

    return NextResponse.json({
      stations,
      total,
      online,
      offline,
      faulted,
      charging,
    })
  } catch (error) {
    console.error("Fetch stations error:", error)
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    )
  }
}
