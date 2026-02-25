import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CarData } from "@/hooks/useCarData";
import { Car, Save } from "lucide-react";

interface CarSettingsProps {
  car: CarData;
  onUpdate: (info: Partial<CarData>) => void;
}

export default function CarSettings({ car, onUpdate }: CarSettingsProps) {
  const [brand, setBrand] = useState(car.brand);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(String(car.year));
  const [plate, setPlate] = useState(car.plate);

  const handleSave = () => {
    onUpdate({ brand, model, year: Number(year), plate });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Car className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-heading font-bold">Dati Auto</h2>
      </div>

      <div className="bg-card rounded-lg p-5 border border-border/50 space-y-4 max-w-lg">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Marca</label>
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="es. Fiat" className="bg-muted border-border" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Modello</label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="es. Panda" className="bg-muted border-border" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Anno</label>
          <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="bg-muted border-border" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Targa</label>
          <Input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="es. AB123CD" className="bg-muted border-border" />
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Salva
        </Button>
      </div>
    </div>
  );
}
