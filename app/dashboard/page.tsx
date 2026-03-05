import { StationList } from "@/components/dashboard/station-list"
import { StationStats } from "@/components/dashboard/station-stats"

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Charge Stations
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie e monitore suas estacoes de recarga em tempo real
        </p>
      </div>

      <StationStats />
      <StationList />
    </div>
  )
}
