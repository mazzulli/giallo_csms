"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Wifi,
  WifiOff,
  Play,
  Square,
  Plug,
  Loader2,
  Cpu,
  Clock,
} from "lucide-react"
import type { ChargeStation, Evse, ConnectorStatus } from "@/lib/types"

interface StationCardProps {
  station: ChargeStation
  onAction: () => void
}

function getStatusConfig(status: ConnectorStatus) {
  switch (status) {
    case "Available":
      return { label: "Disponivel", className: "bg-success/15 text-success border-success/30" }
    case "Occupied":
      return { label: "Carregando", className: "bg-energy/15 text-energy-foreground border-energy/30" }
    case "Reserved":
      return { label: "Reservado", className: "bg-warning/15 text-warning border-warning/30" }
    case "Faulted":
      return { label: "Falha", className: "bg-destructive/15 text-destructive-foreground border-destructive/30" }
    case "Unavailable":
    default:
      return { label: "Indisponivel", className: "bg-muted text-muted-foreground border-border" }
  }
}

function getConnectorTypeLabel(type: string) {
  switch (type) {
    case "Type1": return "Type 1"
    case "Type2": return "Type 2"
    case "CCS1": return "CCS 1"
    case "CCS2": return "CCS 2"
    case "CHAdeMO": return "CHAdeMO"
    case "cType2": return "Type 2"
    default: return type
  }
}

function formatTimeAgo(date: string | null): string {
  if (!date) return "Nunca"
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) return `${diffSec}s atras`
  if (diffMin < 60) return `${diffMin}m atras`
  if (diffHour < 24) return `${diffHour}h atras`
  return `${Math.floor(diffHour / 24)}d atras`
}

export function StationCard({ station, onAction }: StationCardProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const evse = station.evses?.[0]
  const connector = evse?.connectors?.[0]
  const evseStatus = evse?.status ?? "Unavailable"
  const statusConfig = getStatusConfig(evseStatus as ConnectorStatus)
  const isCharging = evseStatus === "Occupied"
  const canStartCharge = station.isOnline && evseStatus === "Available"
  const canStopCharge = station.isOnline && isCharging

  async function handleAction(action: "start" | "stop") {
    setLoadingAction(action)
    try {
      const res = await fetch(`/api/stations/${station.id}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, evseId: evse?.evseId ?? 1 }),
      })

      if (res.ok) {
        onAction()
      }
    } catch (err) {
      console.error("Command error:", err)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <Card className="border-border/50 transition-colors hover:border-border">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">
              {station.identity}
            </span>
            {station.isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-success" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cpu className="h-3 w-3" />
            <span>{station.vendor} {station.model}</span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={statusConfig.className}
        >
          {statusConfig.label}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {station.serialNumber && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    SN: {station.serialNumber}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Numero de serie</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {connector && (
            <Badge variant="secondary" className="text-[10px]">
              <Plug className="mr-0.5 h-2.5 w-2.5" />
              {getConnectorTypeLabel(connector.type)}
            </Badge>
          )}
          {station.firmwareVersion && (
            <Badge variant="secondary" className="font-mono text-[10px]">
              v{station.firmwareVersion}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Heartbeat: {formatTimeAgo(station.lastHeartbeat)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={canStartCharge ? "default" : "secondary"}
            className="flex-1"
            disabled={!canStartCharge || loadingAction !== null}
            onClick={() => handleAction("start")}
          >
            {loadingAction === "start" ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Play className="mr-1 h-3 w-3" />
            )}
            Iniciar
          </Button>

          <Button
            size="sm"
            variant={canStopCharge ? "destructive" : "secondary"}
            className="flex-1"
            disabled={!canStopCharge || loadingAction !== null}
            onClick={() => handleAction("stop")}
          >
            {loadingAction === "stop" ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Square className="mr-1 h-3 w-3" />
            )}
            Parar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
