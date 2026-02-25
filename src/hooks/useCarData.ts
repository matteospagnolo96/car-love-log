import { useState, useEffect } from "react";

export interface MileageEntry {
  id: string;
  date: string;
  km: number;
  note?: string;
}

export interface MaintenanceEntry {
  id: string;
  type: "tagliando" | "revisione" | "gomme" | "altro";
  date: string;
  km: number;
  description: string;
  cost?: number;
  nextDueDate?: string;
  nextDueKm?: number;
}

export type VehicleType = "auto" | "moto";

export interface Vehicle {
  id: string;
  vehicleType: VehicleType;
  name: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  currentKm: number;
  mileageLog: MileageEntry[];
  maintenanceLog: MaintenanceEntry[];
}

export interface GarageData {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
}

function createVehicle(vehicleType: VehicleType): Vehicle {
  return {
    id: crypto.randomUUID(),
    vehicleType,
    name: vehicleType === "auto" ? "Nuova auto" : "Nuova moto",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    plate: "",
    currentKm: 0,
    mileageLog: [],
    maintenanceLog: [],
  };
}

const DEFAULT_GARAGE: GarageData = {
  vehicles: [],
  activeVehicleId: null,
};

// Migration: convert old single-car format to new garage format
function migrateData(): GarageData {
  const garageRaw = localStorage.getItem("garage-data");
  if (garageRaw) return JSON.parse(garageRaw);

  const carRaw = localStorage.getItem("car-data");
  if (carRaw) {
    const old = JSON.parse(carRaw);
    const vehicle: Vehicle = {
      id: crypto.randomUUID(),
      vehicleType: "auto",
      name: old.name || "La mia auto",
      brand: old.brand || "",
      model: old.model || "",
      year: old.year || new Date().getFullYear(),
      plate: old.plate || "",
      currentKm: old.currentKm || 0,
      mileageLog: old.mileageLog || [],
      maintenanceLog: old.maintenanceLog || [],
    };
    const garage: GarageData = { vehicles: [vehicle], activeVehicleId: vehicle.id };
    localStorage.removeItem("car-data");
    return garage;
  }

  return DEFAULT_GARAGE;
}

export function useCarData() {
  const [garage, setGarage] = useState<GarageData>(migrateData);

  useEffect(() => {
    localStorage.setItem("garage-data", JSON.stringify(garage));
  }, [garage]);

  const activeVehicle = garage.vehicles.find((v) => v.id === garage.activeVehicleId) || null;

  const setActiveVehicle = (id: string) => {
    setGarage((prev) => ({ ...prev, activeVehicleId: id }));
  };

  const addVehicle = (vehicleType: VehicleType) => {
    const v = createVehicle(vehicleType);
    setGarage((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, v],
      activeVehicleId: v.id,
    }));
  };

  const deleteVehicle = (id: string) => {
    setGarage((prev) => {
      const vehicles = prev.vehicles.filter((v) => v.id !== id);
      return {
        vehicles,
        activeVehicleId:
          prev.activeVehicleId === id ? (vehicles[0]?.id || null) : prev.activeVehicleId,
      };
    });
  };

  const updateVehicle = (id: string, fn: (v: Vehicle) => Vehicle) => {
    setGarage((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === id ? fn(v) : v)),
    }));
  };

  const addMileage = (entry: Omit<MileageEntry, "id">) => {
    if (!activeVehicle) return;
    const newEntry = { ...entry, id: crypto.randomUUID() };
    updateVehicle(activeVehicle.id, (v) => ({
      ...v,
      currentKm: Math.max(v.currentKm, entry.km),
      mileageLog: [newEntry, ...v.mileageLog],
    }));
  };

  const addMaintenance = (entry: Omit<MaintenanceEntry, "id">) => {
    if (!activeVehicle) return;
    const newEntry = { ...entry, id: crypto.randomUUID() };
    updateVehicle(activeVehicle.id, (v) => ({
      ...v,
      maintenanceLog: [newEntry, ...v.maintenanceLog],
    }));
  };

  const updateCarInfo = (info: Partial<Vehicle>) => {
    if (!activeVehicle) return;
    updateVehicle(activeVehicle.id, (v) => ({ ...v, ...info }));
  };

  const deleteMaintenance = (id: string) => {
    if (!activeVehicle) return;
    updateVehicle(activeVehicle.id, (v) => ({
      ...v,
      maintenanceLog: v.maintenanceLog.filter((e) => e.id !== id),
    }));
  };

  const deleteMileage = (id: string) => {
    if (!activeVehicle) return;
    updateVehicle(activeVehicle.id, (v) => ({
      ...v,
      mileageLog: v.mileageLog.filter((e) => e.id !== id),
    }));
  };

  return {
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
  };
}
