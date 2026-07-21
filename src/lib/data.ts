import { createClient } from "./supabase/server";
import { FitmentEntry, GarageVehicle, Listing, Profile, Vehicle } from "./types";

type ProfileRow = {
  id: string;
  handle: string;
  name: string;
  rating: number;
  sales: number;
  blurb: string;
  location: string;
  user_id: string | null;
  username_set: boolean;
};

type FitmentRow = {
  id: number;
  universal: boolean;
  make: string | null;
  model: string | null;
  year_start: number | null;
  year_end: number | null;
};

type ListingRow = {
  id: number;
  cat: Listing["cat"];
  tint: string;
  title: string;
  price: number;
  cond: string;
  pn: string;
  description: string;
  specs: [string, string][];
  photos: string[];
  seller: ProfileRow;
  fitment: FitmentRow[];
};

type GarageRow = {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  is_primary: boolean;
};

const LISTING_SELECT = "*, seller:profiles(*), fitment:listing_fitment(*)";

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    handle: row.handle,
    name: row.name,
    rating: row.rating,
    sales: row.sales,
    blurb: row.blurb,
    location: row.location,
    userId: row.user_id,
    usernameSet: row.username_set,
  };
}

function mapFitment(row: FitmentRow): FitmentEntry {
  return {
    id: row.id,
    universal: row.universal,
    make: row.make,
    model: row.model,
    yearStart: row.year_start,
    yearEnd: row.year_end,
  };
}

function mapListing(row: ListingRow): Listing {
  const { seller, fitment, ...rest } = row;
  return { ...rest, seller: mapProfile(seller), fitment: fitment.map(mapFitment) };
}

function mapGarageVehicle(row: GarageRow): GarageVehicle {
  return {
    id: row.id,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    isPrimary: row.is_primary,
  };
}

export async function getListings(): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .order("id");

  if (error) throw new Error(`Failed to load listings: ${error.message}`);
  return (data as unknown as ListingRow[]).map(mapListing);
}

export async function getListingById(id: number): Promise<Listing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load listing: ${error.message}`);
  if (!data) return null;
  return mapListing(data as unknown as ListingRow);
}

export async function getListingsBySeller(sellerId: string): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("seller_id", sellerId)
    .order("id");

  if (error) throw new Error(`Failed to load listings: ${error.message}`);
  return (data as unknown as ListingRow[]).map(mapListing);
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load profile: ${error.message}`);
  if (!data) return null;
  return mapProfile(data as ProfileRow);
}

export async function getGarage(userId: string): Promise<GarageVehicle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("garage_vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at");

  if (error) throw new Error(`Failed to load garage: ${error.message}`);
  return (data as GarageRow[]).map(mapGarageVehicle);
}

export async function getPrimaryVehicle(userId: string): Promise<Vehicle | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("garage_vehicles")
    .select("year, make, model")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load primary vehicle: ${error.message}`);
  if (!data) return null;
  return data as Vehicle;
}
