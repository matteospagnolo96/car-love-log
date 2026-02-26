import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import type { MileageEntry, MaintenanceEntry } from "@/hooks/useCarData";

interface MileageChartProps {
  entries: MileageEntry[];
  maintenanceEntries: MaintenanceEntry[];
}

export default function MileageChart({ entries, maintenanceEntries }: MileageChartProps) {
  const chartData = useMemo(() => {
    const parseDate = (d: string) => {
      if (d.includes("/")) {
        const [day, month, year] = d.split("/");
        return new Date(`${year}-${month}-${day}`).getTime();
      }
      return new Date(d).getTime();
    };

    const allPoints = [
      ...entries.map((e) => ({ date: e.date, km: e.km, ts: parseDate(e.date) })),
      ...maintenanceEntries.map((e) => ({ date: new Date(e.date).toLocaleDateString("it-IT"), km: e.km, ts: parseDate(e.date) })),
    ];

    // Deduplicate by keeping highest km per date
    const byDate = new Map<number, { date: string; km: number }>();
    allPoints.forEach((p) => {
      const existing = byDate.get(p.ts);
      if (!existing || p.km > existing.km) {
        byDate.set(p.ts, { date: p.date, km: p.km });
      }
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => v);
  }, [entries, maintenanceEntries]);

  if (chartData.length < 2) {
    return (
      <div className="rounded-lg bg-card p-5 border border-border/50 text-center">
        <p className="text-muted-foreground text-sm">
          Registra almeno 2 letture km per vedere il grafico dell'andamento
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-5 border border-border/50 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/15 text-primary">
          <TrendingUp className="h-5 w-5" />
        </div>
        <span className="font-heading font-semibold">Andamento Chilometri</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
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
