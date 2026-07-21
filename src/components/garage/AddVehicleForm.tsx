"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCarMakes, useModelsForMakeYear } from "@/lib/useVehicleOptions";
import { vehicleYearOptions } from "@/lib/nhtsa";

const inputClass =
  "w-full box-border px-3.5 py-3 rounded-[10px] border border-line bg-white text-sm font-display outline-none";
const YEARS = vehicleYearOptions();

export default function AddVehicleForm({
  userId,
  isFirstVehicle,
}: {
  userId: string;
  isFirstVehicle: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { makes, loading: makesLoading } = useCarMakes();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [make, setMake] = useState("");
  const { models, loading: modelsLoading } = useModelsForMakeYear(make, year);
  const [model, setModel] = useState("");
  const [trimValue, setTrimValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!make || !model) {
      setError("Pick a make and model.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("garage_vehicles").insert({
      user_id: userId,
      year,
      make,
      model,
      trim: trimValue.trim() || null,
      is_primary: isFirstVehicle,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    setMake("");
    setModel("");
    setTrimValue("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl ring-1 ring-cardline p-3.5 flex flex-col gap-2.5"
    >
      <div className="font-bold text-sm">Add a vehicle</div>

      <select
        value={year}
        onChange={(e) => {
          setYear(Number(e.target.value));
          setMake("");
          setModel("");
        }}
        className={inputClass}
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <select
        value={make}
        onChange={(e) => {
          setMake(e.target.value);
          setModel("");
        }}
        className={inputClass}
        disabled={makesLoading}
      >
        <option value="">{makesLoading ? "Loading makes…" : "Select make"}</option>
        {makes.map((m) => (
          <option key={m.id} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className={inputClass}
        disabled={!make || modelsLoading}
      >
        <option value="">
          {!make ? "Select a make first" : modelsLoading ? "Loading models…" : "Select model"}
        </option>
        {models.map((m) => (
          <option key={m.id} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>

      <input
        value={trimValue}
        onChange={(e) => setTrimValue(e.target.value)}
        placeholder="Trim (optional)"
        className={inputClass}
      />

      {error && <p className="text-xs text-accent">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl border-none cursor-pointer bg-accent text-white font-extrabold text-sm disabled:opacity-60"
      >
        {loading ? "Adding…" : "Add to garage"}
      </button>
    </form>
  );
}
