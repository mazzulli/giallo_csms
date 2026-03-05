"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Zap, Wifi, WifiOff, AlertTriangle, BatteryCharging } from "lucide-react"
import type { StationsResponse } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function StationStats() {
  const { data, isLoading } = useSWR<StationsResponse>(
    "/api/stations",
    fetcher,
    { refreshInterval: 10000 }
  )

  const stats = [
    {
      label: "Total",
      value: data?.total ?? 0,
      icon: Zap,
      color: "text-foreground",
      bg: "bg-secondary",
    },
    {
      label: "Online",
      value: data?.online ?? 0,
      icon: Wifi,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Offline",
      value: data?.offline ?? 0,
      icon: WifiOff,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      label: "Carregando",
      value: data?.charging ?? 0,
      icon: BatteryCharging,
      color: "text-energy",
      bg: "bg-energy/10",
    },
    {
      label: "Falha",
      value: data?.faulted ?? 0,
      icon: AlertTriangle,
      color: "text-destructive-foreground",
      bg: "bg-destructive/10",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
