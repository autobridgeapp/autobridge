"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GarageVehicle } from "@/lib/types";
import AddVehicleForm from "./AddVehicleForm";

export default function GarageManager({
  userId,
  vehicles,
}: {
  userId: string;
  vehicles: GarageVehicle[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleSetPrimary(vehicleId: number) {
    setBusyId(vehicleId);
    try {
      const { error: unsetError } = await supabase
        .from("garage_vehicles")
        .update({ is_primary: false })
        .eq("user_id", userId)
        .eq("is_primary", true);
      if (unsetError) throw unsetError;

      const { error: setError } = await supabase
        .from("garage_vehicles")
        .update({ is_primary: true })
        .eq("id", vehicleId);
      if (setError) throw setError;

      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to set primary vehicle.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(vehicle: GarageVehicle) {
    if (!window.confirm(`Remove ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) return;
    setBusyId(vehicle.id);
    try {
      const { error } = await supabase.from("garage_vehicles").delete().eq("id", vehicle.id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to remove vehicle.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-4 pt-5 pb-8">
      <button
        onClick={() => router.back()}
        className="border-none bg-transparent cursor-pointer text-sm font-bold p-0 mb-3"
      >
        ← Back
      </button>
      <h2 className="font-display italic font-black text-2xl tracking-[-0.02em] mb-1">
        My garage
      </h2>
      <p className="text-sm text-muted mb-4">
        Your primary vehicle powers fitment matching across the feed.
      </p>

      <div className="flex flex-col gap-2.5 mb-5">
        {vehicles.length === 0 && (
          <div className="text-center py-6 text-muted text-sm">
            No vehicles yet. Add one below.
          </div>
        )}
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-xl ring-1 ring-cardline p-3.5 flex items-center justify-between gap-3"
          >
            <div>
              <div className="font-bold text-sm">
                {v.year} {v.make} {v.model}
                {v.trim ? ` ${v.trim}` : ""}
              </div>
              {v.isPrimary && (
                <div className="font-mono text-[10px] text-fit mt-1">
                  PRIMARY ● FITMENT ACTIVE
                </div>
              )}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {!v.isPrimary && (
                <button
                  onClick={() => handleSetPrimary(v.id)}
                  disabled={busyId === v.id}
                  className="py-1.5 px-2.5 rounded-md border-none cursor-pointer bg-bg text-[11px] font-bold disabled:opacity-50"
                >
                  Set primary
                </button>
              )}
              <button
                onClick={() => handleRemove(v)}
                disabled={busyId === v.id}
                className="py-1.5 px-2.5 rounded-md border-none cursor-pointer bg-bg text-accent text-[11px] font-bold disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddVehicleForm userId={userId} isFirstVehicle={vehicles.length === 0} />
    </div>
  );
}
