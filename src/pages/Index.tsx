import { useState } from "react";
import { useCarData } from "@/hooks/useCarData";
import Dashboard from "@/components/Dashboard";
import MileageTracker from "@/components/MileageTracker";
import MaintenanceLog from "@/components/MaintenanceLog";
import CarSettings from "@/components/CarSettings";
import VehicleSelector from "@/components/VehicleSelector";
import { Gauge, Wrench, Settings, LayoutDashboard } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "km", label: "Chilometri", icon: Gauge },
  { id: "manutenzione", label: "Manutenzione", icon: Wrench },
  { id: "auto", label: "Dati Veicolo", icon: Settings },
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
  } = useCarData();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const lastOfType = (type: string) => {
    if (!activeVehicle) return undefined;
    const entry = activeVehicle.maintenanceLog.find((e) => e.type === type);
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
          <span className="text-xs text-muted-foreground hidden sm:block">AutoTracker</span>
        </div>
      </header>

      {activeVehicle ? (
        <>
          {/* Tab Navigation */}
          <nav className="border-b border-border/50 bg-card/30">
            <div className="container max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <main className="container max-w-5xl mx-auto px-4 py-8">
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
                lastGomme={lastOfType("gomme")}
                totalMaintenances={activeVehicle.maintenanceLog.length}
              />
            )}
            {activeTab === "km" && (
              <MileageTracker entries={activeVehicle.mileageLog} onAdd={addMileage} onDelete={deleteMileage} />
            )}
            {activeTab === "manutenzione" && (
              <MaintenanceLog entries={activeVehicle.maintenanceLog} onAdd={addMaintenance} onDelete={deleteMaintenance} />
            )}
            {activeTab === "auto" && <CarSettings vehicle={activeVehicle} onUpdate={updateCarInfo} />}
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
