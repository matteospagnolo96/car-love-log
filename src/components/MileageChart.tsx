import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import type { MileageEntry, MaintenanceEntry } from "@/hooks/useCarData";

interface MileageChartProps {
  entries: MileageEntry[];
  maintenanceEntries: MaintenanceEntry[];
}

const PERIODS = [
  { id: "all", label: "Tutto", months: 0 },
  { id: "1y", label: "1 Anno", months: 12 },
  { id: "6m", label: "6 Mesi", months: 6 },
  { id: "3m", label: "3 Mesi", months: 3 },
  { id: "1m", label: "1 Mese", months: 1 },
] as const;

type PeriodId = (typeof PERIODS)[number]["id"];

export default function MileageChart({ entries, maintenanceEntries }: MileageChartProps) {
  const [period, setPeriod] = useState<PeriodId>("all");

  const chartData = useMemo(() => {
    const parseDate = (d: string) => {
      if (d.includes("/")) {
        const [day, month, year] = d.split("/");
        return new Date(`${year}-${month}-${day}`).getTime();
      }
      return new Date(d).getTime();
    };

    const allPoints = [
      ...entries.map((e) => ({ ts: parseDate(e.date), km: e.km })),
      ...maintenanceEntries.map((e) => ({ ts: parseDate(e.date), km: e.km })),
    ];

    // Deduplicate by keeping highest km per timestamp
    const byDate = new Map<number, number>();
    allPoints.forEach((p) => {
      const existing = byDate.get(p.ts);
      if (!existing || p.km > existing) {
        byDate.set(p.ts, p.km);
      }
    });

    const full = Array.from(byDate.entries())
      .sort(([a], [b]) => a - b)
      .map(([ts, km]) => ({ ts, km }));

    // Apply period filter
    const months = PERIODS.find((p) => p.id === period)?.months ?? 0;
    if (months > 0) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);
      return full.filter((p) => p.ts >= cutoff.getTime());
    }
    return full;
  }, [entries, maintenanceEntries, period]);

  if (chartData.length < 2) {
    return (
      <div className="rounded-lg bg-card p-5 border border-border/50 text-center">
        <p className="text-muted-foreground text-sm">
          {entries.length + maintenanceEntries.length < 2
            ? "Registra almeno 2 letture km per vedere il grafico dell'andamento"
            : "Nessun dato nel periodo selezionato"}
        </p>
      </div>
    );
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
  };

  return (
    <div className="rounded-lg bg-card p-5 border border-border/50 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/15 text-primary">
          <TrendingUp className="h-5 w-5" />
        </div>
        <span className="font-heading font-semibold">Andamento Chilometri</span>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-1">
        {PERIODS.map((p) => {
          const isActive = period === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={formatDate}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              labelFormatter={(ts: number) => new Date(ts).toLocaleDateString("it-IT")}
              formatter={(value: number) => [`${value.toLocaleString("it-IT")} km`, "Chilometri"]}
            />
            <Line
              type="monotone"
              dataKey="km"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
