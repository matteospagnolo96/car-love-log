import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import type { MileageEntry } from "@/hooks/useCarData";

interface MileageChartProps {
  entries: MileageEntry[];
}

export default function MileageChart({ entries }: MileageChartProps) {
  const chartData = useMemo(() => {
    if (!entries.length) return [];
    return [...entries]
      .sort((a, b) => {
        const parseDate = (d: string) => {
          // handle both dd/mm/yyyy and yyyy-mm-dd
          if (d.includes("/")) {
            const [day, month, year] = d.split("/");
            return new Date(`${year}-${month}-${day}`).getTime();
          }
          return new Date(d).getTime();
        };
        return parseDate(a.date) - parseDate(b.date);
      })
      .map((e) => ({
        date: e.date,
        km: e.km,
      }));
  }, [entries]);

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
