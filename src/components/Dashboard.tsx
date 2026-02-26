import { Car, Bike, Gauge, Wrench, CircleDot, FileCheck, Settings, LucideIcon } from "lucide-react";
import type { VehicleType, MileageEntry, MaintenanceEntry } from "@/hooks/useCarData";
import MileageChart from "./MileageChart";
import MaintenanceReminders from "./MaintenanceReminders";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

function StatCard({ icon: Icon, label, value, subtitle, accent }: StatCardProps) {
  return (
    <div className="rounded-lg bg-card p-5 animate-fade-in border border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-md ${accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-heading font-bold">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

interface DashboardProps {
  currentKm: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vehicleType: VehicleType;
  lastTagliando?: { date: string; km: number };
  lastRevisione?: { date: string; km: number };
  lastGomme?: { date: string; km: number };
  totalMaintenances: number;
  mileageLog: MileageEntry[];
  maintenanceLog: MaintenanceEntry[];
}

export default function Dashboard({
  currentKm,
  brand,
  model,
  year,
  plate,
  vehicleType,
  lastTagliando,
  lastRevisione,
  lastGomme,
  totalMaintenances,
  mileageLog,
  maintenanceLog,
}: DashboardProps) {
  const carTitle = brand && model ? `${brand} ${model}` : vehicleType === "moto" ? "La mia moto" : "La mia auto";
  const VehicleIcon = vehicleType === "moto" ? Bike : Car;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <VehicleIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold">{carTitle}</h1>
          <p className="text-muted-foreground">
            {year > 0 && `${year} • `}{plate && `${plate}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={Gauge} label="Chilometri" value={currentKm.toLocaleString("it-IT")} subtitle="km totali" accent />
        <StatCard
          icon={Wrench}
          label="Ultimo tagliando"
          value={lastTagliando ? lastTagliando.date : "—"}
          subtitle={lastTagliando ? `a ${lastTagliando.km.toLocaleString("it-IT")} km` : "Non registrato"}
        />
        <StatCard
          icon={FileCheck}
          label="Ultima revisione"
          value={lastRevisione ? lastRevisione.date : "—"}
          subtitle={lastRevisione ? `a ${lastRevisione.km.toLocaleString("it-IT")} km` : "Non registrata"}
        />
        <StatCard
          icon={CircleDot}
          label="Cambio gomme"
          value={lastGomme ? lastGomme.date : "—"}
          subtitle={lastGomme ? `a ${lastGomme.km.toLocaleString("it-IT")} km` : "Non registrato"}
        />
        <StatCard icon={Settings} label="Manutenzioni" value={totalMaintenances} subtitle="totali registrate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MileageChart entries={mileageLog} maintenanceEntries={maintenanceLog} />
        <MaintenanceReminders entries={maintenanceLog} currentKm={currentKm} />
      </div>
    </div>
  );
}
