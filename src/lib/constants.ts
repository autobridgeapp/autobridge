import { Category } from "./types";

export const MY_CAR = { label: "2015 Subaru WRX", short: "'15 WRX" };

export const CATS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wheel", label: "Wheels" },
  { id: "coilover", label: "Suspension" },
  { id: "seat", label: "Seats" },
  { id: "exhaust", label: "Exhaust" },
  { id: "wing", label: "Aero" },
  { id: "turbo", label: "Forced induction" },
];
