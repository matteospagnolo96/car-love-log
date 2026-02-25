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

export interface CarData {
  name: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  currentKm: number;
  mileageLog: MileageEntry[];
  maintenanceLog: MaintenanceEntry[];
}

const DEFAULT_CAR: CarData = {
  name: "La mia auto",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  plate: "",
  currentKm: 0,
  mileageLog: [],
  maintenanceLog: [],
};

export function useCarData() {
  const [car, setCar] = useState<CarData>(() => {
    const saved = localStorage.getItem("car-data");
    return saved ? JSON.parse(saved) : DEFAULT_CAR;
  });

  useEffect(() => {
    localStorage.setItem("car-data", JSON.stringify(car));
  }, [car]);

  const addMileage = (entry: Omit<MileageEntry, "id">) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setCar((prev) => ({
      ...prev,
      currentKm: Math.max(prev.currentKm, entry.km),
      mileageLog: [newEntry, ...prev.mileageLog],
    }));
  };

  const addMaintenance = (entry: Omit<MaintenanceEntry, "id">) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setCar((prev) => ({
      ...prev,
      maintenanceLog: [newEntry, ...prev.maintenanceLog],
    }));
  };

  const updateCarInfo = (info: Partial<CarData>) => {
    setCar((prev) => ({ ...prev, ...info }));
  };

  const deleteMaintenance = (id: string) => {
    setCar((prev) => ({
      ...prev,
      maintenanceLog: prev.maintenanceLog.filter((e) => e.id !== id),
    }));
  };

  const deleteMileage = (id: string) => {
    setCar((prev) => ({
      ...prev,
      mileageLog: prev.mileageLog.filter((e) => e.id !== id),
    }));
  };

  return { car, addMileage, addMaintenance, updateCarInfo, deleteMaintenance, deleteMileage };
}
