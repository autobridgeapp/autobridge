import { createClient } from "./supabase/server";
import { Listing, Profile } from "./types";

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

type ListingRow = {
  id: number;
  cat: Listing["cat"];
  tint: string;
  title: string;
  price: number;
  cond: string;
  pn: string;
  fits: string[];
  fits_my_car: boolean;
  description: string;
  specs: [string, string][];
  seller: ProfileRow;
};

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

function mapListing(row: ListingRow): Listing {
  const { fits_my_car, seller, ...rest } = row;
  return { ...rest, fitsMyCar: fits_my_car, seller: mapProfile(seller) };
}

export async function getListings(): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, seller:profiles(*)")
    .order("id");

  if (error) throw new Error(`Failed to load listings: ${error.message}`);
  return (data as unknown as ListingRow[]).map(mapListing);
}

export async function getListingById(id: number): Promise<Listing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, seller:profiles(*)")
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
    .select("*, seller:profiles(*)")
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
