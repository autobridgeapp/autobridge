"use client";

import { useEffect, useState } from "react";
import { fetchCarMakes, fetchModelsForMakeYear, VehicleMake, VehicleModel } from "./nhtsa";

export function useCarMakes() {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCarMakes()
      .then((result) => {
        if (!cancelled) setMakes(result);
      })
      .catch(() => {
        if (!cancelled) setMakes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { makes, loading };
}

export function useModelsForMakeYear(make: string, year: number | null) {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!make || !year) {
      setModels([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchModelsForMakeYear(make, year)
      .then((result) => {
        if (!cancelled) setModels(result);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [make, year]);

  return { models, loading };
}
