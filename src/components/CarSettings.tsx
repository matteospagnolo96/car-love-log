import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/hooks/useCarData";
import { Car, Bike, Save, Download } from "lucide-react";
import { toast } from "sonner";
import ImportCSV from "./ImportCSV";

interface CarSettingsProps {
  vehicle: Vehicle;
  onUpdate: (info: Partial<Vehicle>) => void;
}

function exportVehicleCSV(vehicle: Vehicle) {
  const lines: string[] = [];

  // Vehicle info
  lines.push("=== DATI VEICOLO ===");
  lines.push("Tipo,Marca,Modello,Anno,Targa,Km Attuali");
  lines.push(`${vehicle.vehicleType},${vehicle.brand},${vehicle.model},${vehicle.year},${vehicle.plate},${vehicle.currentKm}`);
  lines.push("");

  // Mileage log
  lines.push("=== REGISTRO CHILOMETRI ===");
  lines.push("Data,Km,Note");
  vehicle.mileageLog.forEach((e) => {
    lines.push(`${e.date},${e.km},"${e.note || ""}"`);
  });
  lines.push("");

  // Maintenance log
  lines.push("=== REGISTRO MANUTENZIONE ===");
  lines.push("Data,Tipo,Descrizione,Km,Costo");
  vehicle.maintenanceLog.forEach((e) => {
    lines.push(`${e.date},${e.type},"${e.description}",${e.km},${e.cost || ""}`);
  });
  lines.push("");

  // Reminders
  lines.push("=== PROMEMORIA ===");
  lines.push("Etichetta,Scadenza Data,Scadenza Km");
  (vehicle.reminders || []).forEach((r) => {
    lines.push(`"${r.label}",${r.dueDate || ""},${r.dueKm || ""}`);
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${vehicle.brand || vehicle.vehicleType}_${vehicle.model || "veicolo"}_export.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV esportato!");
}

export default function CarSettings({ vehicle, onUpdate }: CarSettingsProps) {
  const [brand, setBrand] = useState(vehicle.brand);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(String(vehicle.year));
  const [plate, setPlate] = useState(vehicle.plate);

  const handleSave = () => {
    onUpdate({ brand, model, year: Number(year), plate });
  };

  const Icon = vehicle.vehicleType === "moto" ? Bike : Car;
  const label = vehicle.vehicleType === "moto" ? "Dati Moto" : "Dati Auto";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-heading font-bold">{label}</h2>
      </div>

      <div className="bg-card rounded-lg p-5 border border-border/50 space-y-4 max-w-lg">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Marca</label>
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={vehicle.vehicleType === "moto" ? "es. Ducati" : "es. Fiat"} className="bg-muted border-border" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Modello</label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder={vehicle.vehicleType === "moto" ? "es. Monster" : "es. Panda"} className="bg-muted border-border" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Anno</label>
          <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="bg-muted border-border" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Targa</label>
          <Input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="es. AB123CD" className="bg-muted border-border" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Salva
          </Button>
          <Button variant="outline" onClick={() => exportVehicleCSV(vehicle)} className="gap-2">
            <Download className="h-4 w-4" /> Esporta CSV
          </Button>
          <ImportCSV onImport={onUpdate} />
        </div>
      </div>
    </div>
  );
}