"use client"

import useSWR from "swr"
import { StationCard } from "@/components/dashboard/station-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import type { StationsResponse, ChargeStation } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function StationList() {
  const { data, isLoading, mutate } = useSWR<StationsResponse>(
    "/api/stations",
    fetcher,
    { refreshInterval: 10000 }
  )

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/50 p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!data?.stations?.length) {
    return (
      <Card className="border-border/50 p-12 text-center">
        <p className="text-muted-foreground">
          Nenhuma estacao de recarga cadastrada
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.stations.map((station: ChargeStation) => (
        <StationCard key={station.id} station={station} onAction={mutate} />
      ))}
    </div>
  )
}
