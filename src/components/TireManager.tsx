import { useState } from "react";
import { CircleDot, Plus, Trash2, ArrowRightLeft, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TireSet, TireType } from "@/hooks/useCarData";
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
  if (tire.active && tire.installedAt != null) {
    return tire.totalKm + Math.max(0, currentKm - tire.installedAt);
  }
  return tire.totalKm;
}

export default function TireManager({ tireSets, currentKm, onAdd, onDelete, onEdit, onSwitch }: TireManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    onAdd({
      label: label.trim(),
      type,
      brand: brand.trim(),
      model: model.trim(),
      totalKm: 0,
      active: tireSets.length === 0,
      installedAt: tireSets.length === 0 ? currentKm : undefined,
      installedDate: tireSets.length === 0 ? new Date().toISOString().slice(0, 10) : undefined,
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

      {/* Active tire summary */}
      {activeTire && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Gomme montate</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-bold">{activeTire.label}</span>
            <Badge variant="outline" className={TIRE_TYPE_COLORS[activeTire.type]}>
              {TIRE_TYPE_LABELS[activeTire.type]}
            </Badge>
            <span className="text-sm text-muted-foreground ml-auto">
              {getTireKm(activeTire, currentKm).toLocaleString("it-IT")} km percorsi
            </span>
          </div>
          {activeTire.brand && (
            <p className="text-xs text-muted-foreground mt-1">
              {activeTire.brand} {activeTire.model}
            </p>
          )}
        </div>
      )}

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

      {/* Tire list */}
      {tireSets.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <CircleDot className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nessun set di gomme registrato</p>
          <p className="text-sm">Aggiungi il tuo primo set di gomme</p>
        </div>
      )}

      <div className="space-y-3">
        {tireSets.map((tire) => {
          const isEditing = editingId === tire.id;
          const km = getTireKm(tire, currentKm);

          if (isEditing) {
            return (
              <div key={tire.id} className="bg-card border border-primary/30 rounded-lg p-4 space-y-3">
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
              className={`bg-card border rounded-lg p-4 transition-colors ${
                tire.active ? "border-primary/40" : "border-border/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold">{tire.label}</span>
                    <Badge variant="outline" className={TIRE_TYPE_COLORS[tire.type]}>
                      {TIRE_TYPE_LABELS[tire.type]}
                    </Badge>
                    {tire.active && (
                      <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
                        Montate
                      </Badge>
                    )}
                  </div>
                  {(tire.brand || tire.model) && (
                    <p className="text-sm text-muted-foreground">{tire.brand} {tire.model}</p>
                  )}
                  <p className="text-sm mt-1">
                    <span className="font-medium">{km.toLocaleString("it-IT")}</span>
                    <span className="text-muted-foreground"> km percorsi</span>
                  </p>
                  {tire.installedDate && tire.active && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Montate dal {new Date(tire.installedDate).toLocaleDateString("it-IT")}
                    </p>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
