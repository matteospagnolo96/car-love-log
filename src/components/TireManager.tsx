import { useState } from "react";
import { CircleDot, Plus, Trash2, ArrowRightLeft, Pencil, X, Check, Route, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TireSet, TireType, MountEvent } from "@/hooks/useCarData";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  estive: "Estive",
  invernali: "Invernali",
  "4stagioni": "4 Stagioni",
};

const TIRE_TYPE_COLORS: Record<TireType, string> = {
  estive: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  invernali: "bg-sky-500/15 text-sky-600 border-sky-500/30",
  "4stagioni": "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

function getTireKm(tire: TireSet, currentKm: number): number {
  const history = tire.mountHistory || [];
  let km = tire.totalKm || 0;
  for (const event of history) {
    const end = event.unmountedAt ?? (tire.active ? currentKm : event.mountedAt);
    km += Math.max(0, end - event.mountedAt);
  }
  return km;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TireManager({ tireSets, currentKm, onAdd, onDelete, onEdit, onSwitch }: TireManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<TireType>("4stagioni");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const activeTire = tireSets.find((t) => t.active);

  const handleAdd = () => {
    if (!label.trim()) {
      toast.error("Inserisci un nome per le gomme");
      return;
    }
    const isFirst = tireSets.length === 0;
    const now = new Date().toISOString().slice(0, 10);
    onAdd({
      label: label.trim(),
      type,
      brand: brand.trim(),
      model: model.trim(),
      totalKm: 0,
      active: isFirst,
      installedAt: isFirst ? currentKm : undefined,
      installedDate: isFirst ? now : undefined,
      mountHistory: isFirst ? [{ mountedAt: currentKm, mountedDate: now }] : [],
    });
    setLabel("");
    setBrand("");
    setModel("");
    setShowForm(false);
    toast.success("Gomme aggiunte!");
  };

  const handleSwitch = (tireId: string) => {
    onSwitch(tireId);
    toast.success("Gomme montate!");
  };

  const startEdit = (tire: TireSet) => {
    setEditingId(tire.id);
    setLabel(tire.label);
    setType(tire.type);
    setBrand(tire.brand || "");
    setModel(tire.model || "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    onEdit(editingId, { label, type, brand, model });
    setEditingId(null);
    toast.success("Gomme aggiornate!");
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nome *</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="es. Michelin Estive" className="bg-muted border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tipo</label>
              <div className="flex gap-2">
                {(["estive", "invernali", "4stagioni"] as TireType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 text-xs py-2 px-2 rounded-md border transition-colors ${
                      type === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {TIRE_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Marca</label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="es. Michelin" className="bg-muted border-border" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Modello</label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="es. Pilot Sport 4" className="bg-muted border-border" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Aggiungi
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Annulla
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {tireSets.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <CircleDot className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nessun set di gomme registrato</p>
          <p className="text-sm">Aggiungi il tuo primo set di gomme</p>
        </div>
      )}

      {/* Tire cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tireSets.map((tire) => {
          const isEditing = editingId === tire.id;
          const km = getTireKm(tire, currentKm);
          const isExpanded = expandedId === tire.id;
          const history = tire.mountHistory || [];

          if (isEditing) {
            return (
              <div key={tire.id} className="rounded-lg bg-card p-5 border border-primary/30 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Nome</label>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} className="bg-muted border-border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Tipo</label>
                    <div className="flex gap-2">
                      {(["estive", "invernali", "4stagioni"] as TireType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setType(t)}
                          className={`flex-1 text-xs py-2 px-2 rounded-md border transition-colors ${
                            type === t
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {TIRE_TYPE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Marca</label>
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-muted border-border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Modello</label>
                    <Input value={model} onChange={(e) => setModel(e.target.value)} className="bg-muted border-border" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} className="gap-1">
                    <Check className="h-3.5 w-3.5" /> Salva
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" /> Annulla
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={tire.id}
              className={`rounded-lg bg-card p-5 animate-fade-in border hover:border-primary/30 transition-colors ${
                tire.active ? "border-primary/40" : "border-border/50"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-heading font-bold">{tire.label}</span>
                  <Badge variant="outline" className={TIRE_TYPE_COLORS[tire.type]}>
                    {TIRE_TYPE_LABELS[tire.type]}
                  </Badge>
                  {tire.active && (
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                      Montate
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!tire.active && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Monta queste gomme">
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Montare {tire.label}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {activeTire
                              ? `Le gomme "${activeTire.label}" verranno smontate e sostituite con "${tire.label}".`
                              : `Le gomme "${tire.label}" verranno impostate come montate.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleSwitch(tire.id)}>Monta</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(tire)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminare {tire.label}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Questo set di gomme verrà rimosso permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(tire.id)}>Elimina</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Brand info */}
              {(tire.brand || tire.model) && (
                <p className="text-sm text-muted-foreground mb-2">{tire.brand} {tire.model}</p>
              )}

              {/* Total km */}
              <p className="text-2xl font-heading font-bold mb-1">
                {km.toLocaleString("it-IT")} <span className="text-sm font-normal text-muted-foreground">km percorsi</span>
              </p>

              {tire.active && tire.installedDate && (
                <p className="text-xs text-muted-foreground mb-3">
                  Montate dal {formatDate(tire.installedDate)}
                </p>
              )}

              {/* Movement history toggle */}
              {history.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : tire.id)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Storico movimenti ({history.length})</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1.5 animate-fade-in">
                      {[...history].reverse().map((event, i) => {
                        const periodKm = event.unmountedAt
                          ? event.unmountedAt - event.mountedAt
                          : tire.active
                          ? currentKm - event.mountedAt
                          : 0;
                        return (
                          <div key={i} className="flex items-center gap-3 text-xs p-2 rounded-md bg-muted/50">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${!event.unmountedAt && tire.active ? "bg-primary" : "bg-muted-foreground/40"}`} />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">
                                {formatDate(event.mountedDate)}
                              </span>
                              {event.unmountedDate && (
                                <span className="text-muted-foreground"> → {formatDate(event.unmountedDate)}</span>
                              )}
                              {!event.unmountedAt && tire.active && (
                                <span className="text-primary"> → in uso</span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-medium">{Math.max(0, periodKm).toLocaleString("it-IT")} km</span>
                              <span className="text-muted-foreground ml-1">
                                ({event.mountedAt.toLocaleString("it-IT")} → {(event.unmountedAt ?? (tire.active ? currentKm : event.mountedAt)).toLocaleString("it-IT")})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
