import { useState } from "react";
import { CircleDot, Plus, Trash2, ArrowRightLeft, Pencil, X, Check, Calendar, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TireSet, TireType, MountEvent } from "@/hooks/useCarData";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TireManagerProps {
  tireSets: TireSet[];
  currentKm: number;
  onAdd: (tire: Omit<TireSet, "id">) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Omit<TireSet, "id">>) => void;
  onSwitch: (tireId: string) => void;
}

const TIRE_TYPE_LABELS: Record<TireType, string> = {
  estive: "Estive", invernali: "Invernali", "4stagioni": "4 Stagioni",
};

const TIRE_TYPE_COLORS: Record<TireType, string> = {
  estive: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  invernali: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  "4stagioni": "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

function getTireKm(tire: TireSet, currentKm: number): number {
  const history = tire.mountHistory || [];
  return history.reduce((acc, event) => {
    const end = event.unmountedAt ?? (tire.active ? currentKm : event.mountedAt);
    return acc + Math.max(0, end - event.mountedAt);
  }, 0);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TireManager({ tireSets, currentKm, onAdd, onDelete, onEdit, onSwitch }: TireManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addEventTireId, setAddEventTireId] = useState<string | null>(null);
  const [eventType, setEventType] = useState<"mount" | "unmount">("mount");
  const [eventKm, setEventKm] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));

  // New tire form
  const [label, setLabel] = useState("");
  const [type, setType] = useState<TireType>("4stagioni");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [firstInstallKm, setFirstInstallKm] = useState("");
  const [firstInstallDate, setFirstInstallDate] = useState(new Date().toISOString().slice(0, 10));
  const [mountOnCreate, setMountOnCreate] = useState(true);

  const activeTire = tireSets.find((t) => t.active);

  const handleAdd = () => {
    if (!label.trim()) { toast.error("Inserisci un nome"); return; }
    const installKm = Number(firstInstallKm);
    if (mountOnCreate && (!firstInstallKm || installKm < 0)) { toast.error("Inserisci i km della macchina all'installazione"); return; }

    const shouldMount = mountOnCreate;
    const history: MountEvent[] = shouldMount
      ? [{ mountedAt: installKm, mountedDate: firstInstallDate }]
      : [];

    onAdd({
      label: label.trim(), type, brand: brand.trim(), model: model.trim(),
      totalKm: 0, active: shouldMount,
      installedAt: shouldMount ? installKm : undefined,
      installedDate: shouldMount ? firstInstallDate : undefined,
      mountHistory: history,
    });
    setLabel(""); setBrand(""); setModel(""); setFirstInstallKm(""); setShowForm(false); setMountOnCreate(true);
    toast.success("Gomme aggiunte!");
  };

  const handleSwitch = (tireId: string) => { onSwitch(tireId); toast.success("Gomme montate!"); };

  const startEdit = (tire: TireSet) => {
    setEditingId(tire.id); setLabel(tire.label); setType(tire.type);
    setBrand(tire.brand || ""); setModel(tire.model || "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    onEdit(editingId, { label, type, brand, model });
    setEditingId(null); toast.success("Gomme aggiornate!");
  };

  const handleAddEvent = (tireId: string) => {
    const kmVal = Number(eventKm);
    if (!eventKm || kmVal < 0) { toast.error("Inserisci i km della macchina"); return; }
    if (!eventDate) { toast.error("Inserisci la data"); return; }

    const tire = tireSets.find((t) => t.id === tireId);
    if (!tire) return;
    const history = [...(tire.mountHistory || [])];

    if (eventType === "mount") {
      // Auto-unmount the currently active tire
      if (activeTire && activeTire.id !== tireId) {
        const activeHistory = [...(activeTire.mountHistory || [])];
        const lastOpen = activeHistory.findIndex((e) => !e.unmountedAt);
        if (lastOpen !== -1) {
          activeHistory[lastOpen] = { ...activeHistory[lastOpen], unmountedAt: kmVal, unmountedDate: eventDate };
        }
        onEdit(activeTire.id, { mountHistory: activeHistory, active: false });
      }
      // Open a new mount period
      history.push({ mountedAt: kmVal, mountedDate: eventDate });
      onEdit(tireId, { mountHistory: history, active: true, installedAt: kmVal, installedDate: eventDate });
      toast.success("Montaggio registrato!");
    } else {
      // Close the last open mount period
      const lastOpen = history.findIndex((e) => !e.unmountedAt);
      if (lastOpen === -1) { toast.error("Nessun periodo di montaggio aperto"); return; }
      history[lastOpen] = { ...history[lastOpen], unmountedAt: kmVal, unmountedDate: eventDate };
      onEdit(tireId, { mountHistory: history, active: false });
      toast.success("Smontaggio registrato!");
    }

    setAddEventTireId(null); setEventKm(""); setEventDate(new Date().toISOString().slice(0, 10));
  };

  const openAddEvent = (tireId: string, type: "mount" | "unmount") => {
    setAddEventTireId(tireId);
    setEventType(type);
    setEventKm("");
    setEventDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CircleDot className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-heading font-bold">Gestione Gomme</h2>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" /> Nuove Gomme
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-card border border-border/50 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-heading font-semibold">Aggiungi set di gomme</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nome *</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="es. Michelin Estive" className="bg-muted border-border h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tipo</label>
              <div className="flex gap-1">
                {(["estive", "invernali", "4stagioni"] as TireType[]).map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={`flex-1 text-[11px] py-1.5 px-1 rounded-md border transition-colors ${
                      type === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                    }`}>{TIRE_TYPE_LABELS[t]}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Marca</label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="es. Michelin" className="bg-muted border-border h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Modello</label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="es. Pilot Sport 4" className="bg-muted border-border h-9 text-sm" />
            </div>
          </div>

          {/* First install info */}
          <div className="border-t border-border/50 pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={mountOnCreate} onChange={(e) => setMountOnCreate(e.target.checked)}
                className="rounded border-border" id="mount-on-create" />
              <label htmlFor="mount-on-create" className="text-xs text-muted-foreground">Monta subito queste gomme</label>
            </div>
            {mountOnCreate && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Km macchina all'installazione *</label>
                  <Input type="number" value={firstInstallKm} onChange={(e) => setFirstInstallKm(e.target.value)}
                    placeholder={`es. ${currentKm}`} className="bg-muted border-border h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Data installazione</label>
                  <Input type="date" value={firstInstallDate} onChange={(e) => setFirstInstallDate(e.target.value)}
                    className="bg-muted border-border h-9 text-sm" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" className="gap-1 h-8 text-xs"><Plus className="h-3.5 w-3.5" /> Aggiungi</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="h-8 text-xs">Annulla</Button>
          </div>
        </div>
      )}

      {/* Empty */}
      {tireSets.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <CircleDot className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nessun set di gomme registrato</p>
          <p className="text-sm">Aggiungi il tuo primo set di gomme</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tireSets.map((tire) => {
          const isEditing = editingId === tire.id;
          const km = getTireKm(tire, currentKm);
          const isExpanded = expandedId === tire.id;
          const isAddingEvent = addEventTireId === tire.id;
          const history = tire.mountHistory || [];
          const hasOpenPeriod = history.some((e) => !e.unmountedAt);

          if (isEditing) {
            return (
              <div key={tire.id} className="sm:col-span-2 rounded-lg bg-card p-4 border border-primary/30 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><label className="text-xs text-muted-foreground">Nome</label>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} className="bg-muted border-border h-8 text-sm" /></div>
                  <div className="space-y-1"><label className="text-xs text-muted-foreground">Tipo</label>
                    <div className="flex gap-1">{(["estive", "invernali", "4stagioni"] as TireType[]).map((t) => (
                      <button key={t} onClick={() => setType(t)} className={`flex-1 text-[10px] py-1.5 rounded-md border ${type === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>{TIRE_TYPE_LABELS[t]}</button>
                    ))}</div></div>
                  <div className="space-y-1"><label className="text-xs text-muted-foreground">Marca</label>
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-muted border-border h-8 text-sm" /></div>
                  <div className="space-y-1"><label className="text-xs text-muted-foreground">Modello</label>
                    <Input value={model} onChange={(e) => setModel(e.target.value)} className="bg-muted border-border h-8 text-sm" /></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} className="gap-1 h-7 text-xs"><Check className="h-3 w-3" /> Salva</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs"><X className="h-3 w-3" /> Annulla</Button>
                </div>
              </div>
            );
          }

          return (
            <div key={tire.id} className={`rounded-lg bg-card p-4 animate-fade-in border hover:border-primary/30 transition-colors ${tire.active ? "border-primary/40" : "border-border/50"}`}>
              {/* Header */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <Badge variant="outline" className={TIRE_TYPE_COLORS[tire.type] + " text-[10px] px-1.5 py-0"}>
                  {TIRE_TYPE_LABELS[tire.type]}
                </Badge>
                {tire.active && (
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] px-1.5 py-0">Montate</Badge>
                )}
              </div>

              {/* Name */}
              <p className="text-sm font-heading font-bold truncate">{tire.label}</p>
              {(tire.brand || tire.model) && (
                <p className="text-[11px] text-muted-foreground truncate">{tire.brand} {tire.model}</p>
              )}

              {/* KM effettivi */}
              <p className="text-xl font-heading font-bold mt-2">
                {km.toLocaleString("it-IT")} <span className="text-xs font-normal text-muted-foreground">km gomme</span>
              </p>
              {tire.active && tire.installedDate && (
                <p className="text-[10px] text-muted-foreground">montate dal {formatDate(tire.installedDate)} a {(tire.installedAt ?? 0).toLocaleString("it-IT")} km</p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-1 mt-3 border-t border-border/50 pt-2 flex-wrap">
                {/* Mount / Unmount */}
                {tire.active ? (
                  <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1"
                    onClick={() => openAddEvent(tire.id, "unmount")}>
                    <ArrowRightLeft className="h-3 w-3" /> Smonta
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1"
                    onClick={() => openAddEvent(tire.id, "mount")}>
                    <ArrowRightLeft className="h-3 w-3" /> Monta
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(tire)} title="Modifica">
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setExpandedId(isExpanded ? null : tire.id)} title="Storico">
                  <Calendar className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive ml-auto"><Trash2 className="h-3 w-3" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminare {tire.label}?</AlertDialogTitle>
                      <AlertDialogDescription>Questo set verrà rimosso permanentemente.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(tire.id)}>Elimina</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Mount/Unmount event form */}
              {isAddingEvent && (
                <div className="mt-2 pt-2 border-t border-border/50 space-y-2 animate-fade-in">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    {eventType === "mount" ? "📥 Registra montaggio" : "📤 Registra smontaggio"}
                  </p>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Km macchina al momento</label>
                    <Input type="number" placeholder={`es. ${currentKm}`} value={eventKm}
                      onChange={(e) => setEventKm(e.target.value)} className="bg-muted border-border h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Data</label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                      className="bg-muted border-border h-8 text-sm" />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleAddEvent(tire.id)} className="gap-1 h-7 text-xs flex-1">
                      <Check className="h-3 w-3" /> {eventType === "mount" ? "Monta" : "Smonta"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddEventTireId(null)} className="h-7 text-xs">✕</Button>
                  </div>
                </div>
              )}

              {/* History */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-border/50 space-y-1 animate-fade-in">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1">Storico movimenti</p>
                  {history.length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic">Nessun movimento registrato</p>
                  )}
                  {[...history].reverse().map((event, i) => {
                    const periodKm = event.unmountedAt != null
                      ? event.unmountedAt - event.mountedAt
                      : tire.active ? currentKm - event.mountedAt : 0;
                    return (
                      <div key={i} className="text-[11px] p-1.5 rounded bg-muted/50 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${!event.unmountedAt && tire.active ? "bg-primary" : "bg-muted-foreground/40"}`} />
                        <div className="flex-1 min-w-0">
                          <span>📥 {formatDate(event.mountedDate)} ({event.mountedAt.toLocaleString("it-IT")} km)</span>
                          {event.unmountedDate ? (
                            <span className="text-muted-foreground"> → 📤 {formatDate(event.unmountedDate)} ({event.unmountedAt!.toLocaleString("it-IT")} km)</span>
                          ) : tire.active && (
                            <span className="text-primary"> → in uso</span>
                          )}
                        </div>
                        <span className="font-medium shrink-0">{Math.max(0, periodKm).toLocaleString("it-IT")} km</span>
                      </div>
                    );
                  })}
                  <div className="text-[11px] font-semibold text-right pt-1 border-t border-border/30">
                    Totale: {km.toLocaleString("it-IT")} km
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
