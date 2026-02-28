import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/hooks/useCarData";
import { toast } from "sonner";

interface ImportCSVProps {
  onImport: (data: Partial<Vehicle>) => void;
}

function parseCSV(text: string): Partial<Vehicle> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const result: Partial<Vehicle> = {};
  let section = "";

  for (const line of lines) {
    if (line.startsWith("===")) {
      if (line.includes("DATI VEICOLO")) section = "vehicle";
      else if (line.includes("REGISTRO CHILOMETRI")) section = "mileage";
      else if (line.includes("REGISTRO MANUTENZIONE")) section = "maintenance";
      else if (line.includes("PROMEMORIA")) section = "reminders";
      continue;
    }

    // Skip header rows
    if (
      line.startsWith("Tipo,") ||
      line.startsWith("Data,Km,") ||
      line.startsWith("Data,Tipo,") ||
      line.startsWith("Etichetta,")
    )
      continue;

    const parts = line.split(",").map((p) => p.replace(/^"|"$/g, "").trim());

    if (section === "vehicle" && parts.length >= 6) {
      result.vehicleType = parts[0] === "moto" ? "moto" : "auto";
      result.brand = parts[1];
      result.model = parts[2];
      result.year = Number(parts[3]) || new Date().getFullYear();
      result.plate = parts[4];
      result.currentKm = Number(parts[5]) || 0;
    }

    if (section === "mileage" && parts.length >= 2) {
      if (!result.mileageLog) result.mileageLog = [];
      result.mileageLog.push({
        id: crypto.randomUUID(),
        date: parts[0],
        km: Number(parts[1]) || 0,
        note: parts[2] || undefined,
      });
    }

    if (section === "maintenance" && parts.length >= 4) {
      if (!result.maintenanceLog) result.maintenanceLog = [];
      result.maintenanceLog.push({
        id: crypto.randomUUID(),
        date: parts[0],
        type: (parts[1] as any) || "altro",
        description: parts[2],
        km: Number(parts[3]) || 0,
        cost: parts[4] ? Number(parts[4]) : undefined,
      });
    }

    if (section === "reminders" && parts.length >= 1) {
      if (!result.reminders) result.reminders = [];
      result.reminders.push({
        id: crypto.randomUUID(),
        label: parts[0],
        dueDate: parts[1] || undefined,
        dueKm: parts[2] ? Number(parts[2]) : undefined,
      });
    }
  }

  return result;
}

export default function ImportCSV({ onImport }: ImportCSVProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = parseCSV(text);
        onImport(data);
        toast.success("Dati importati con successo!");
      } catch {
        toast.error("Errore nel parsing del file CSV");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
      <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
        <Upload className="h-4 w-4" /> Importa CSV
      </Button>
    </>
  );
}
