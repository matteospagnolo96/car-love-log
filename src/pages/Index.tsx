import { useState } from "react";
import { useCarData } from "@/hooks/useCarData";
import Dashboard from "@/components/Dashboard";
import MileageTracker from "@/components/MileageTracker";
import MaintenanceLog from "@/components/MaintenanceLog";
import CarSettings from "@/components/CarSettings";
import { Car, Gauge, Wrench, Settings } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Car },
  { id: "km", label: "Chilometri", icon: Gauge },
  { id: "manutenzione", label: "Manutenzione", icon: Wrench },
  { id: "auto", label: "Dati Auto", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

const Index = () => {
  const { car, addMileage, addMaintenance, updateCarInfo, deleteMaintenance, deleteMileage } = useCarData();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const lastOfType = (type: string) => {
    const entry = car.maintenanceLog.find((e) => e.type === type);
    return entry ? { date: new Date(entry.date).toLocaleDateString("it-IT"), km: entry.km } : undefined;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/15">
            <Car className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-lg">AutoTracker</h1>
        </div>
      </header>

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
            currentKm={car.currentKm}
            brand={car.brand}
            model={car.model}
            year={car.year}
            plate={car.plate}
            lastTagliando={lastOfType("tagliando")}
            lastRevisione={lastOfType("revisione")}
            lastGomme={lastOfType("gomme")}
            totalMaintenances={car.maintenanceLog.length}
          />
        )}
        {activeTab === "km" && (
          <MileageTracker entries={car.mileageLog} onAdd={addMileage} onDelete={deleteMileage} />
        )}
        {activeTab === "manutenzione" && (
          <MaintenanceLog entries={car.maintenanceLog} onAdd={addMaintenance} onDelete={deleteMaintenance} />
        )}
        {activeTab === "auto" && <CarSettings car={car} onUpdate={updateCarInfo} />}
      </main>
    </div>
  );
};

export default Index;
