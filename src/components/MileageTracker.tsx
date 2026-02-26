import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Gauge, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MileageEntry } from "@/hooks/useCarData";

interface MileageTrackerProps {
  entries: MileageEntry[];
  onAdd: (entry: Omit<MileageEntry, "id">) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Omit<MileageEntry, "id">>) => void;
}

export default function MileageTracker({ entries, onAdd, onDelete, onEdit }: MileageTrackerProps) {
  const [km, setKm] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKm, setEditKm] = useState("");
  const [editNote, setEditNote] = useState("");

  const handleAdd = () => {
    if (!km || isNaN(Number(km))) {
      toast.error("Inserisci un valore km valido");
      return;
    }
    onAdd({
      date: new Date().toLocaleDateString("it-IT"),
      km: Number(km),
      note: note || undefined,
    });
    setKm("");
    setNote("");
    toast.success("Chilometri registrati!");
  };

  const startEdit = (entry: MileageEntry) => {
    setEditingId(entry.id);
    setEditKm(String(entry.km));
    setEditNote(entry.note || "");
  };

  const saveEdit = () => {
    if (!editingId || !editKm || isNaN(Number(editKm))) {
      toast.error("Inserisci un valore km valido");
      return;
    }
    onEdit(editingId, { km: Number(editKm), note: editNote || undefined });
    setEditingId(null);
    toast.success("Registrazione aggiornata!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Gauge className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-heading font-bold">Registro Chilometri</h2>
      </div>

      <div className="bg-card rounded-lg p-5 border border-border/50 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="number"
            placeholder="Chilometri attuali"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="bg-muted border-border"
          />
          <Input
            placeholder="Nota (opzionale)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-muted border-border"
          />
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Registra
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-muted-foreground text-center py-8">Nessuna registrazione km</p>
        )}
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className="flex items-center justify-between bg-card rounded-lg p-4 border border-border/50 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {editingId === entry.id ? (
              <>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-muted-foreground w-24">{entry.date}</span>
                  <Input type="number" value={editKm} onChange={(e) => setEditKm(e.target.value)} className="bg-muted border-border w-32" />
                  <Input value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Nota" className="bg-muted border-border w-40" />
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
                  <span className="text-sm text-muted-foreground w-24">{entry.date}</span>
                  <span className="font-heading font-semibold text-lg">{entry.km.toLocaleString("it-IT")} km</span>
                  {entry.note && <span className="text-sm text-muted-foreground">— {entry.note}</span>}
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
        ))}
      </div>
    </div>
  );
}
