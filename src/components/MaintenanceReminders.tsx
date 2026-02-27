import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Plus, Trash2, Pencil, Check, X, Calendar, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Reminder } from "@/hooks/useCarData";
import { toast } from "sonner";

type ReminderMode = "date" | "km";

interface MaintenanceRemindersProps {
  reminders: Reminder[];
  currentKm: number;
  onAdd: (reminder: Omit<Reminder, "id">) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Omit<Reminder, "id">>) => void;
}

export default function MaintenanceReminders({ reminders, currentKm, onAdd, onDelete, onEdit }: MaintenanceRemindersProps) {
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<ReminderMode>("date");
  const [dueDate, setDueDate] = useState("");
  const [dueKm, setDueKm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editMode, setEditMode] = useState<ReminderMode>("date");
  const [editDate, setEditDate] = useState("");
  const [editKm, setEditKm] = useState("");

  const handleAdd = () => {
    if (!label) {
      toast.error("Inserisci un nome per il promemoria");
      return;
    }
    if (mode === "date" && !dueDate) {
      toast.error("Inserisci una data di scadenza");
      return;
    }
    if (mode === "km" && !dueKm) {
      toast.error("Inserisci i km di scadenza");
      return;
    }
    onAdd({
      label,
      dueDate: mode === "date" ? dueDate : undefined,
      dueKm: mode === "km" ? Number(dueKm) : undefined,
    });
    setLabel("");
    setDueDate("");
    setDueKm("");
    toast.success("Promemoria aggiunto!");
  };

  const startEdit = (r: Reminder) => {
    setEditingId(r.id);
    setEditLabel(r.label);
    setEditMode(r.dueKm ? "km" : "date");
    setEditDate(r.dueDate || "");
    setEditKm(r.dueKm ? String(r.dueKm) : "");
  };

  const saveEdit = () => {
    if (!editingId || !editLabel) return;
    onEdit(editingId, {
      label: editLabel,
      dueDate: editMode === "date" ? editDate || undefined : undefined,
      dueKm: editMode === "km" ? Number(editKm) || undefined : undefined,
    });
    setEditingId(null);
    toast.success("Promemoria aggiornato!");
  };

  const statusData = useMemo(() => {
    const now = new Date();
    return (reminders || []).map((r) => {
      let status: "ok" | "warning" | "overdue" = "ok";
      let remaining = "";

      if (r.dueDate) {
        const due = new Date(r.dueDate);
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 0) {
          status = "overdue";
          remaining = `⚠️ Scaduto da ${Math.abs(daysUntil)} giorni`;
        } else if (daysUntil <= 30) {
          status = "warning";
          remaining = `Mancano ${daysUntil} giorni (${due.toLocaleDateString("it-IT")})`;
        } else {
          const months = Math.floor(daysUntil / 30);
          const days = daysUntil % 30;
          remaining = months > 0
            ? `Mancano ${months} mesi e ${days} giorni (${due.toLocaleDateString("it-IT")})`
            : `Mancano ${daysUntil} giorni (${due.toLocaleDateString("it-IT")})`;
        }
      }

      if (r.dueKm) {
        const kmLeft = r.dueKm - currentKm;
        if (kmLeft <= 0) {
          status = "overdue";
          remaining = `⚠️ Superati di ${Math.abs(kmLeft).toLocaleString("it-IT")} km`;
        } else if (kmLeft <= 2000) {
          if (status !== "overdue") status = "warning";
          remaining = `Mancano ${kmLeft.toLocaleString("it-IT")} km`;
        } else {
          remaining = `Mancano ${kmLeft.toLocaleString("it-IT")} km`;
        }
      }

      return { ...r, status, remaining };
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
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="Es. Revisione, Assicurazione..." value={label} onChange={(e) => setLabel(e.target.value)} className="bg-muted border-border flex-1" />
        </div>
        <div className="flex items-center gap-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as ReminderMode)} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="date" id="mode-date" />
              <Label htmlFor="mode-date" className="text-sm flex items-center gap-1 cursor-pointer"><Calendar className="h-3.5 w-3.5" /> Data</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="km" id="mode-km" />
              <Label htmlFor="mode-km" className="text-sm flex items-center gap-1 cursor-pointer"><Gauge className="h-3.5 w-3.5" /> Chilometri</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex gap-2">
          {mode === "date" ? (
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-muted border-border flex-1" />
          ) : (
            <Input type="number" placeholder="Km scadenza" value={dueKm} onChange={(e) => setDueKm(e.target.value)} className="bg-muted border-border flex-1" />
          )}
          <Button onClick={handleAdd} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Aggiungi
          </Button>
        </div>
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
                  <RadioGroup value={editMode} onValueChange={(v) => setEditMode(v as ReminderMode)} className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="date" id={`edit-date-${editingId}`} />
                      <Label htmlFor={`edit-date-${editingId}`} className="text-xs cursor-pointer">Data</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="km" id={`edit-km-${editingId}`} />
                      <Label htmlFor={`edit-km-${editingId}`} className="text-xs cursor-pointer">Km</Label>
                    </div>
                  </RadioGroup>
                  {editMode === "date" ? (
                    <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="bg-muted border-border w-36" />
                  ) : (
                    <Input type="number" value={editKm} onChange={(e) => setEditKm(e.target.value)} placeholder="Km" className="bg-muted border-border w-24" />
                  )}
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
                  <p className="text-xs text-muted-foreground">{r.remaining}</p>
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
