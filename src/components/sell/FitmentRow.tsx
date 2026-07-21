"use client";

import { useCarMakes, useModelsForMakeYear } from "@/lib/useVehicleOptions";
import { vehicleYearOptions } from "@/lib/nhtsa";

export type FitmentRowState = {
  universal: boolean;
  yearStart: string;
  yearEnd: string;
  make: string;
  model: string;
};

const YEARS = vehicleYearOptions();
const inputClass =
  "w-full box-border px-2.5 py-2 rounded-[8px] border border-line bg-white text-xs font-display outline-none";

export default function FitmentRow({
  value,
  onChange,
  onRemove,
  canRemove,
}: {
  value: FitmentRowState;
  onChange: (next: FitmentRowState) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { makes, loading: makesLoading } = useCarMakes();
  const yearForModels = value.yearStart ? Number(value.yearStart) : null;
  const { models, loading: modelsLoading } = useModelsForMakeYear(value.make, yearForModels);

  return (
    <div className="bg-white rounded-xl ring-1 ring-cardline p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold">
          <input
            type="checkbox"
            checked={value.universal}
            onChange={(e) => onChange({ ...value, universal: e.target.checked })}
          />
          Universal (fits most vehicles)
        </label>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="border-none bg-transparent cursor-pointer text-accent text-xs font-bold"
          >
            Remove
          </button>
        )}
      </div>

      {!value.universal && (
        <>
          <div className="flex gap-2">
            <select
              value={value.yearStart}
              onChange={(e) => onChange({ ...value, yearStart: e.target.value, model: "" })}
              className={inputClass}
            >
              <option value="">Year from</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={value.yearEnd}
              onChange={(e) => onChange({ ...value, yearEnd: e.target.value })}
              className={inputClass}
            >
              <option value="">Year to (or current)</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={value.make}
              onChange={(e) => onChange({ ...value, make: e.target.value, model: "" })}
              className={inputClass}
              disabled={makesLoading}
            >
              <option value="">{makesLoading ? "Loading makes…" : "Make"}</option>
              {makes.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={value.model}
              onChange={(e) => onChange({ ...value, model: e.target.value })}
              className={inputClass}
              disabled={!value.make || !value.yearStart || modelsLoading}
            >
              <option value="">
                {!value.make || !value.yearStart
                  ? "Pick make + year first"
                  : modelsLoading
                    ? "Loading…"
                    : "Model"}
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
