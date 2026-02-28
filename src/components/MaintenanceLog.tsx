import { useState } from "react";
import { Plus, Trash2, Wrench, FileCheck, CircleDot, Settings, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceEntry } from "@/hooks/useCarData";
import { toast } from "sonner";

const TYPE_CONFIG = {
  tagliando: { label: "Tagliando", icon: Wrench, color: "text-primary" },
  revisione: { label: "Revisione", icon: FileCheck, color: "text-info" },
  gomme: { label: "Cambio Gomme", icon: CircleDot, color: "text-warning" },
  altro: { label: "Altro", icon: Settings, color: "text-muted-foreground" },
} as const;

interface MaintenanceLogProps {
  entries: MaintenanceEntry[];
  onAdd: (entry: Omit<MaintenanceEntry, "id">) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Omit<MaintenanceEntry, "id">>) => void;
}

export default function MaintenanceLog({ entries, onAdd, onDelete, onEdit }: MaintenanceLogProps) {
  const today = new Date().toISOString().split("T")[0];
  const [type, setType] = useState<MaintenanceEntry["type"]>("tagliando");
  const [date, setDate] = useState(today);
  const [km, setKm] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editKm, setEditKm] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCost, setEditCost] = useState("");

  const handleAdd = () => {
    if (!date || !km || !description) {
      toast.error("Compila tutti i campi obbligatori (data, km, descrizione)");
      return;
    }
    onAdd({
      type,
      date,
      km: Number(km),
      description,
      cost: cost ? Number(cost) : undefined,
    });
    setKm("");
    setDescription("");
    setCost("");
    toast.success("Manutenzione aggiunta!");
  };

  const startEdit = (entry: MaintenanceEntry) => {
    setEditingId(entry.id);
    setEditDate(entry.date);
    setEditKm(String(entry.km));
    setEditDesc(entry.description);
    setEditCost(entry.cost ? String(entry.cost) : "");
  };

  const saveEdit = () => {
    if (!editingId || !editDate || !editKm || !editDesc) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    onEdit(editingId, {
      date: editDate,
      km: Number(editKm),
      description: editDesc,
      cost: editCost ? Number(editCost) : undefined,
    });
    setEditingId(null);
    toast.success("Manutenzione aggiornata!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-heading font-bold">Manutenzione</h2>
      </div>

      <div className="bg-card rounded-lg p-5 border border-border/50 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={type} onValueChange={(v) => setType(v as MaintenanceEntry["type"])}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tagliando">🔧 Tagliando</SelectItem>
              <SelectItem value="revisione">📋 Revisione</SelectItem>
              <SelectItem value="gomme">🛞 Cambio Gomme</SelectItem>
              <SelectItem value="altro">⚙️ Altro</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-muted border-border" />
          <Input type="number" placeholder="Km" value={km} onChange={(e) => setKm(e.target.value)} className="bg-muted border-border" />
          <Input placeholder="Descrizione" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-muted border-border" />
          <Input type="number" placeholder="Costo €" value={cost} onChange={(e) => setCost(e.target.value)} className="bg-muted border-border" />
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Aggiungi
        </Button>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-muted-foreground text-center py-8">Nessuna manutenzione registrata</p>
        )}
        {[...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, i) => {
          const config = TYPE_CONFIG[entry.type];
          const Icon = config.icon;
          return (
            <div
              key={entry.id}
              className="flex items-center justify-between bg-card rounded-lg p-4 border border-border/50 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {editingId === entry.id ? (
                <>
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="bg-muted border-border w-36" />
                    <Input type="number" value={editKm} onChange={(e) => setEditKm(e.target.value)} placeholder="Km" className="bg-muted border-border w-24" />
                    <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descrizione" className="bg-muted border-border w-40" />
                    <Input type="number" value={editCost} onChange={(e) => setEditCost(e.target.value)} placeholder="€" className="bg-muted border-border w-20" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={saveEdit} className="text-green-500 hover:text-green-600">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="text-muted-foreground">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold">{config.label}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {new Date(entry.date).toLocaleDateString("it-IT")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.description} • {entry.km.toLocaleString("it-IT")} km
                        {entry.cost && ` • €${entry.cost.toLocaleString("it-IT")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(entry)} className="text-muted-foreground hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(entry.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
