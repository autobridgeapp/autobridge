import { FitmentEntry, Vehicle } from "./types";

export function listingFitsVehicle(fitment: FitmentEntry[], vehicle: Vehicle): boolean {
  return fitment.some((f) => {
    if (f.universal) return true;
    if (!f.make || !f.model || f.yearStart === null) return false;
    if (f.make.toLowerCase() !== vehicle.make.toLowerCase()) return false;
    if (f.model.toLowerCase() !== vehicle.model.toLowerCase()) return false;
    if (vehicle.year < f.yearStart) return false;
    if (f.yearEnd !== null && vehicle.year > f.yearEnd) return false;
    return true;
  });
}

export function formatVehicleShort(vehicle: Vehicle): string {
  return `'${String(vehicle.year).slice(-2)} ${vehicle.model}`;
}

export function formatVehicleLabel(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export function formatFitmentEntry(f: FitmentEntry): string {
  if (f.universal) return "Universal — fits most vehicles";
  const range = f.yearEnd && f.yearEnd !== f.yearStart ? `${f.yearStart}–${f.yearEnd}` : `${f.yearStart}+`;
  return `${range} ${f.make} ${f.model}`;
}
