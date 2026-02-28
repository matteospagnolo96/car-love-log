import { useMemo } from "react";
import { Car, Bike, Gauge, Wrench, CircleDot, FileCheck, Settings, LucideIcon, Euro } from "lucide-react";
import type { VehicleType, MileageEntry, MaintenanceEntry, Reminder } from "@/hooks/useCarData";
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
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, "id">) => void;
  onDeleteReminder: (id: string) => void;
  onEditReminder: (id: string, data: Partial<Omit<Reminder, "id">>) => void;
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
  reminders,
  onAddReminder,
  onDeleteReminder,
  onEditReminder,
}: DashboardProps) {
  const carTitle = brand && model ? `${brand} ${model}` : vehicleType === "moto" ? "La mia moto" : "La mia auto";
  const VehicleIcon = vehicleType === "moto" ? Bike : Car;

  const costSummary = useMemo(() => {
    const total = maintenanceLog.reduce((sum, e) => sum + (e.cost || 0), 0);
    const byType: Record<string, number> = {};
    maintenanceLog.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + (e.cost || 0);
    });
    return { total, byType };
  }, [maintenanceLog]);

  const typeLabels: Record<string, string> = {
    tagliando: "Tagliando",
    revisione: "Revisione",
    gomme: "Cambio Gomme",
    altro: "Altro",
  };

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
          value={lastTagliando ? `${lastTagliando.km.toLocaleString("it-IT")} km` : "—"}
          subtitle={lastTagliando ? lastTagliando.date : "Non registrato"}
        />
        <StatCard
          icon={FileCheck}
          label="Ultima revisione"
          value={lastRevisione ? `${lastRevisione.km.toLocaleString("it-IT")} km` : "—"}
          subtitle={lastRevisione ? lastRevisione.date : "Non registrata"}
        />
        <StatCard
          icon={CircleDot}
          label="Cambio gomme"
          value={lastGomme ? `${(currentKm - lastGomme.km).toLocaleString("it-IT")} km` : "—"}
          subtitle={lastGomme ? `dal ${lastGomme.date}` : "Non registrato"}
        />
        <StatCard icon={Settings} label="Manutenzioni" value={totalMaintenances} subtitle="totali registrate" />
        <StatCard icon={Euro} label="Costi totali" value={`€${costSummary.total.toLocaleString("it-IT")}`} subtitle="manutenzione" accent />
      </div>

      {/* Riepilogo costi per tipo */}
      {costSummary.total > 0 && (
        <div className="bg-card rounded-lg p-5 border border-border/50">
          <h3 className="text-sm font-heading font-semibold mb-3 text-muted-foreground">Riepilogo Costi Manutenzione</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(costSummary.byType).map(([type, amount]) => (
              <div key={type} className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground">{typeLabels[type] || type}</p>
                <p className="text-lg font-bold">€{amount.toLocaleString("it-IT")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MileageChart entries={mileageLog} maintenanceEntries={maintenanceLog} />
        <MaintenanceReminders reminders={reminders} currentKm={currentKm} onAdd={onAddReminder} onDelete={onDeleteReminder} onEdit={onEditReminder} />
      </div>
    </div>
  );
}
