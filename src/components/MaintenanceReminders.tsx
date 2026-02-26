import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { MaintenanceEntry } from "@/hooks/useCarData";

interface MaintenanceRemindersProps {
  entries: MaintenanceEntry[];
  currentKm: number;
}

interface Reminder {
  type: string;
  label: string;
  status: "ok" | "warning" | "overdue";
  message: string;
}

const INTERVALS: Record<string, { label: string; months: number; km: number }> = {
  tagliando: { label: "Tagliando", months: 12, km: 15000 },
  revisione: { label: "Revisione", months: 24, km: Infinity },
  gomme: { label: "Cambio Gomme", months: 6, km: 40000 },
};

export default function MaintenanceReminders({ entries, currentKm }: MaintenanceRemindersProps) {
  const reminders = useMemo<Reminder[]>(() => {
    const now = new Date();
    return Object.entries(INTERVALS).map(([type, config]) => {
      const last = entries.find((e) => e.type === type);

      if (!last) {
        return {
          type,
          label: config.label,
          status: "warning" as const,
          message: "Mai registrato — da programmare",
        };
      }

      const lastDate = new Date(last.date);
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + config.months);

      const kmSinceLast = currentKm - last.km;
      const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const kmOverdue = config.km !== Infinity && kmSinceLast >= config.km;
      const dateOverdue = daysUntil <= 0;
      const kmWarning = config.km !== Infinity && kmSinceLast >= config.km * 0.8;
      const dateWarning = daysUntil <= 30;

      if (kmOverdue || dateOverdue) {
        const reasons: string[] = [];
        if (dateOverdue) reasons.push(`scaduto da ${Math.abs(daysUntil)} giorni`);
        if (kmOverdue) reasons.push(`superati ${kmSinceLast.toLocaleString("it-IT")} km`);
        return {
          type,
          label: config.label,
          status: "overdue" as const,
          message: `⚠️ ${reasons.join(" e ")}`,
        };
      }

      if (kmWarning || dateWarning) {
        const reasons: string[] = [];
        if (dateWarning) reasons.push(`tra ${daysUntil} giorni`);
        if (kmWarning) reasons.push(`${(config.km - kmSinceLast).toLocaleString("it-IT")} km rimanenti`);
        return {
          type,
          label: config.label,
          status: "warning" as const,
          message: `In scadenza: ${reasons.join(", ")}`,
        };
      }

      return {
        type,
        label: config.label,
        status: "ok" as const,
        message: `Prossimo: ${nextDate.toLocaleDateString("it-IT")}${config.km !== Infinity ? ` o tra ${(config.km - kmSinceLast).toLocaleString("it-IT")} km` : ""}`,
      };
    });
  }, [entries, currentKm]);

  const statusIcon = {
    ok: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <Clock className="h-5 w-5 text-yellow-500" />,
    overdue: <AlertTriangle className="h-5 w-5 text-red-500" />,
  };

  const statusBorder = {
    ok: "border-green-500/20",
    warning: "border-yellow-500/20",
    overdue: "border-red-500/20 bg-red-500/5",
  };

  return (
    <div className="rounded-lg bg-card p-5 border border-border/50 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/15 text-primary">
          <Clock className="h-5 w-5" />
        </div>
        <span className="font-heading font-semibold">Promemoria Scadenze</span>
      </div>
      <div className="space-y-2">
        {reminders.map((r) => (
          <div
            key={r.type}
            className={`flex items-center gap-3 p-3 rounded-lg border ${statusBorder[r.status]}`}
          >
            {statusIcon[r.status]}
            <div className="flex-1">
              <span className="font-medium text-sm">{r.label}</span>
              <p className="text-xs text-muted-foreground">{r.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
