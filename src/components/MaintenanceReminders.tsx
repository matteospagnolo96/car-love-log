import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Reminder } from "@/hooks/useCarData";
import { toast } from "sonner";

interface MaintenanceRemindersProps {
  reminders: Reminder[];
  currentKm: number;
  onAdd: (reminder: Omit<Reminder, "id">) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Omit<Reminder, "id">>) => void;
}

export default function MaintenanceReminders({ reminders, currentKm, onAdd, onDelete, onEdit }: MaintenanceRemindersProps) {
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueKm, setDueKm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editKm, setEditKm] = useState("");

  const handleAdd = () => {
    if (!label || (!dueDate && !dueKm)) {
      toast.error("Inserisci un nome e almeno una scadenza (data o km)");
      return;
    }
    onAdd({
      label,
      dueDate: dueDate || undefined,
      dueKm: dueKm ? Number(dueKm) : undefined,
    });
    setLabel("");
    setDueDate("");
    setDueKm("");
    toast.success("Promemoria aggiunto!");
  };

  const startEdit = (r: Reminder) => {
    setEditingId(r.id);
    setEditLabel(r.label);
    setEditDate(r.dueDate || "");
    setEditKm(r.dueKm ? String(r.dueKm) : "");
  };

  const saveEdit = () => {
    if (!editingId || !editLabel) return;
    onEdit(editingId, {
      label: editLabel,
      dueDate: editDate || undefined,
      dueKm: editKm ? Number(editKm) : undefined,
    });
    setEditingId(null);
    toast.success("Promemoria aggiornato!");
  };

  const statusData = useMemo(() => {
    const now = new Date();
    return (reminders || []).map((r) => {
      let status: "ok" | "warning" | "overdue" = "ok";
      const reasons: string[] = [];

      if (r.dueDate) {
        const due = new Date(r.dueDate);
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 0) {
          status = "overdue";
          reasons.push(`scaduto da ${Math.abs(daysUntil)} giorni`);
        } else if (daysUntil <= 30) {
          status = "warning";
          reasons.push(`tra ${daysUntil} giorni`);
        }
      }

      if (r.dueKm) {
        const kmLeft = r.dueKm - currentKm;
        if (kmLeft <= 0) {
          status = "overdue";
          reasons.push(`superati di ${Math.abs(kmLeft).toLocaleString("it-IT")} km`);
        } else if (kmLeft <= 2000) {
          if (status !== "overdue") status = "warning";
          reasons.push(`${kmLeft.toLocaleString("it-IT")} km rimanenti`);
        }
      }

      const message = reasons.length
        ? (status === "overdue" ? "⚠️ " : "In scadenza: ") + reasons.join(", ")
        : `Scadenza: ${r.dueDate ? new Date(r.dueDate).toLocaleDateString("it-IT") : ""}${r.dueKm ? ` ${r.dueKm.toLocaleString("it-IT")} km` : ""}`;

      return { ...r, status, message };
    });
  }, [reminders, currentKm]);

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

      {/* Add form */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <Input placeholder="Es. Revisione" value={label} onChange={(e) => setLabel(e.target.value)} className="bg-muted border-border" />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-muted border-border" />
        <Input type="number" placeholder="Km scadenza" value={dueKm} onChange={(e) => setDueKm(e.target.value)} className="bg-muted border-border" />
        <Button onClick={handleAdd} size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Aggiungi
        </Button>
      </div>

      <div className="space-y-2">
        {statusData.length === 0 && (
          <p className="text-muted-foreground text-center py-4 text-sm">Nessun promemoria impostato</p>
        )}
        {statusData.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${statusBorder[r.status]}`}
          >
            {editingId === r.id ? (
              <>
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="bg-muted border-border w-32" />
                  <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="bg-muted border-border w-36" />
                  <Input type="number" value={editKm} onChange={(e) => setEditKm(e.target.value)} placeholder="Km" className="bg-muted border-border w-24" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={saveEdit} className="text-green-500"><Check className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                </div>
              </>
            ) : (
              <>
                {statusIcon[r.status]}
                <div className="flex-1">
                  <span className="font-medium text-sm">{r.label}</span>
                  <p className="text-xs text-muted-foreground">{r.message}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(r)} className="text-muted-foreground hover:text-primary h-8 w-8">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(r.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                    <Trash2 className="h-3 w-3" />
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
