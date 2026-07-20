import { supabase } from "./supabase";
import { Listing, Seller } from "./types";

type SellerRow = {
  id: string;
  handle: string;
  name: string;
  rating: number;
  sales: number;
  blurb: string;
  location: string;
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
  seller: SellerRow;
};

function mapListing(row: ListingRow): Listing {
  const { fits_my_car, seller, ...rest } = row;
  return { ...rest, fitsMyCar: fits_my_car, seller: seller as Seller };
}

export async function getListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, seller:sellers(*)")
    .order("id");

  if (error) throw new Error(`Failed to load listings: ${error.message}`);
  return (data as unknown as ListingRow[]).map(mapListing);
}

export async function getListingById(id: number): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, seller:sellers(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load listing: ${error.message}`);
  if (!data) return null;
  return mapListing(data as unknown as ListingRow);
}
