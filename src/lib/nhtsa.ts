const BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

export type VehicleMake = { id: number; name: string };
export type VehicleModel = { id: number; name: string };

// Scoped to passenger cars, trucks, and SUVs/crossovers (not
// motorcycles/trailers/etc) -- NHTSA's unfiltered make list has 12,000+
// entries, mostly small commercial and specialty builders.
const VEHICLE_TYPES = ["car", "truck", "multipurpose passenger vehicle (mpv)"];

export async function fetchCarMakes(): Promise<VehicleMake[]> {
  const responses = await Promise.all(
    VEHICLE_TYPES.map((type) =>
      fetch(`${BASE}/GetMakesForVehicleType/${encodeURIComponent(type)}?format=json`)
    )
  );
  if (responses.some((res) => !res.ok)) throw new Error("Failed to load makes");

  const results = (
    await Promise.all(responses.map((res) => res.json()))
  ).flatMap((data) => (data.Results ?? []) as { MakeId: number; MakeName: string }[]);

  const seen = new Set<number>();
  const makes: VehicleMake[] = [];
  for (const r of results) {
    if (seen.has(r.MakeId)) continue;
    seen.add(r.MakeId);
    makes.push({ id: r.MakeId, name: r.MakeName });
  }
  return makes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchModelsForMakeYear(
  make: string,
  year: number
): Promise<VehicleModel[]> {
  const res = await fetch(
    `${BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
  );
  if (!res.ok) throw new Error("Failed to load models");
  const data = await res.json();
  const results = (data.Results ?? []) as {
    Model_ID: number;
    Model_Name: string;
  }[];

  const seen = new Set<number>();
  const models: VehicleModel[] = [];
  for (const r of results) {
    if (seen.has(r.Model_ID)) continue;
    seen.add(r.Model_ID);
    models.push({ id: r.Model_ID, name: r.Model_Name });
  }
  return models.sort((a, b) => a.name.localeCompare(b.name));
}

export function vehicleYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear + 1; y >= 1980; y--) years.push(y);
  return years;
}
