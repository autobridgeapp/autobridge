import { Category } from "./types";

export const CATS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wheel", label: "Wheels" },
  { id: "coilover", label: "Suspension" },
  { id: "seat", label: "Seats" },
  { id: "exhaust", label: "Exhaust" },
  { id: "wing", label: "Aero" },
  { id: "turbo", label: "Forced induction" },
];
