import { Car, Bike, Plus, Trash2, ChevronDown } from "lucide-react";
import { Vehicle, VehicleType } from "@/hooks/useCarData";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  onSelect: (id: string) => void;
  onAdd: (type: VehicleType) => void;
  onDelete: (id: string) => void;
}

export default function VehicleSelector({ vehicles, activeVehicle, onSelect, onAdd, onDelete }: VehicleSelectorProps) {
  const getIcon = (type: VehicleType) => (type === "moto" ? Bike : Car);
  const getLabel = (v: Vehicle) => {
    if (v.brand && v.model) return `${v.brand} ${v.model}`;
    return v.name;
  };

  if (vehicles.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onAdd("auto")} className="gap-2">
          <Car className="h-4 w-4" /> Aggiungi Auto
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAdd("moto")} className="gap-2">
          <Bike className="h-4 w-4" /> Aggiungi Moto
        </Button>
      </div>
    );
  }

  const ActiveIcon = activeVehicle ? getIcon(activeVehicle.vehicleType) : Car;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 font-heading font-bold text-lg h-auto py-1 px-2">
          <ActiveIcon className="h-5 w-5 text-primary" />
          {activeVehicle ? getLabel(activeVehicle) : "Seleziona veicolo"}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {vehicles.map((v) => {
          const Icon = getIcon(v.vehicleType);
          return (
            <DropdownMenuItem
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={`gap-3 ${v.id === activeVehicle?.id ? "bg-accent" : ""}`}
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="flex-1 truncate">{getLabel(v)}</span>
              <span className="text-xs text-muted-foreground">
                {v.vehicleType === "moto" ? "Moto" : "Auto"}
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminare {getLabel(v)}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tutti i dati (km, manutenzioni) verranno persi. Questa azione non è reversibile.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(v.id)}>Elimina</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onAdd("auto")} className="gap-3">
          <Plus className="h-4 w-4" /> Aggiungi Auto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAdd("moto")} className="gap-3">
          <Plus className="h-4 w-4" /> Aggiungi Moto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
