import { useState, useCallback } from "react";
import { useSwipe } from "@/hooks/useSwipe";
import { useCarData } from "@/hooks/useCarData";
import Dashboard from "@/components/Dashboard";
import MileageTracker from "@/components/MileageTracker";
import MaintenanceLog from "@/components/MaintenanceLog";
import CarSettings from "@/components/CarSettings";
import VehicleSelector from "@/components/VehicleSelector";
import TireManager from "@/components/TireManager";
import { Gauge, Wrench, LayoutDashboard, CircleDot, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "km", label: "Chilometri", icon: Gauge },
  { id: "manutenzione", label: "Manutenzione", icon: Wrench },
  { id: "gomme", label: "Gomme", icon: CircleDot },
] as const;

type TabId = (typeof TABS)[number]["id"];

const Index = () => {
  const {
    garage,
    activeVehicle,
    setActiveVehicle,
    addVehicle,
    deleteVehicle,
    addMileage,
    addMaintenance,
    updateCarInfo,
    deleteMaintenance,
    deleteMileage,
    editMileage,
    editMaintenance,
    addReminder,
    deleteReminder,
    editReminder,
    addTireSet,
    deleteTireSet,
    editTireSet,
    switchTires,
  } = useCarData();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const lastOfType = (type: string) => {
    if (!activeVehicle) return undefined;
    const sorted = activeVehicle.maintenanceLog
      .filter((e) => e.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const entry = sorted[0];
    return entry ? { date: new Date(entry.date).toLocaleDateString("it-IT"), km: entry.km } : undefined;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <VehicleSelector
            vehicles={garage.vehicles}
            activeVehicle={activeVehicle}
            onSelect={setActiveVehicle}
            onAdd={addVehicle}
            onDelete={deleteVehicle}
          />
          <div className="flex items-center gap-2">
            {activeVehicle && (
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Dati Veicolo</DialogTitle>
                  </DialogHeader>
                  <CarSettings vehicle={activeVehicle} onUpdate={updateCarInfo} />
                </DialogContent>
              </Dialog>
            )}
            <span className="text-xs text-muted-foreground hidden sm:block">AutoTracker</span>
          </div>
        </div>
      </header>

      {activeVehicle ? (
        <>
          {/* Floating Bottom Tab Bar */}
          <nav className="fixed bottom-4 left-4 right-4 z-50 bg-card/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg px-2 py-1.5 flex justify-around max-w-md mx-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-0 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "scale-110" : ""} transition-transform`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <main className="container max-w-5xl mx-auto px-4 py-8 pb-24">
            <div key={activeTab} className="animate-fade-in">
              {activeTab === "dashboard" && (
                <Dashboard
                  currentKm={activeVehicle.currentKm}
                  brand={activeVehicle.brand}
                  model={activeVehicle.model}
                  year={activeVehicle.year}
                  plate={activeVehicle.plate}
                  vehicleType={activeVehicle.vehicleType}
                  lastTagliando={lastOfType("tagliando")}
                  lastRevisione={lastOfType("revisione")}
                  totalMaintenances={activeVehicle.maintenanceLog.length}
                  mileageLog={activeVehicle.mileageLog}
                  maintenanceLog={activeVehicle.maintenanceLog}
                  reminders={activeVehicle.reminders || []}
                  tireSets={activeVehicle.tireSets || []}
                  onAddReminder={addReminder}
                  onDeleteReminder={deleteReminder}
                  onEditReminder={editReminder}
                />
              )}
              {activeTab === "km" && (
                <MileageTracker entries={activeVehicle.mileageLog} onAdd={addMileage} onDelete={deleteMileage} onEdit={editMileage} />
              )}
              {activeTab === "manutenzione" && (
                <MaintenanceLog entries={activeVehicle.maintenanceLog} onAdd={addMaintenance} onDelete={deleteMaintenance} onEdit={editMaintenance} />
              )}
              {activeTab === "gomme" && (
                <TireManager
                  tireSets={activeVehicle.tireSets || []}
                  currentKm={activeVehicle.currentKm}
                  onAdd={addTireSet}
                  onDelete={deleteTireSet}
                  onEdit={editTireSet}
                  onSwitch={switchTires}
                />
              )}
            </div>
          </main>
        </>
      ) : (
        <main className="container max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-2xl font-heading font-bold">Benvenuto in AutoTracker</h2>
          <p className="text-muted-foreground">Aggiungi il tuo primo veicolo per iniziare</p>
        </main>
      )}
    </div>
  );
};

export default Index;
