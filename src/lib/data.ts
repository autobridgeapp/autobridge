import { createClient } from "./supabase/server";
import { FitmentEntry, GarageVehicle, Listing, Message, Profile, Thread, ThreadPreview, Vehicle } from "./types";

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

type MessageRow = {
  id: number;
  thread_id: number;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

type ThreadPreviewRow = {
  thread_id: number;
  listing_id: number;
  buyer_id: string;
  seller_id: string;
  listing_title: string;
  listing_cat: Listing["cat"];
  listing_tint: string;
  listing_photos: string[];
  buyer_handle: string;
  seller_handle: string;
  last_message_body: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  unread_count: number;
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

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

function mapThreadPreview(row: ThreadPreviewRow): ThreadPreview {
  return {
    threadId: row.thread_id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    listingTitle: row.listing_title,
    listingCat: row.listing_cat,
    listingTint: row.listing_tint,
    listingPhotos: row.listing_photos,
    buyerHandle: row.buyer_handle,
    sellerHandle: row.seller_handle,
    lastMessageBody: row.last_message_body,
    lastMessageAt: row.last_message_at,
    lastMessageSenderId: row.last_message_sender_id,
    unreadCount: row.unread_count,
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

export async function getLikedListingIds(userId: string): Promise<Set<number>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("likes")
    .select("listing_id")
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to load likes: ${error.message}`);
  return new Set((data as { listing_id: number }[]).map((r) => r.listing_id));
}

export async function getLikedListings(userId: string): Promise<Listing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("likes")
    .select(`listing:listings(${LISTING_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load liked listings: ${error.message}`);
  return (data as unknown as { listing: ListingRow }[]).map((r) => mapListing(r.listing));
}

export async function getThreadPreviews(userId: string): Promise<ThreadPreview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("thread_previews")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("thread_id", { ascending: false });

  if (error) throw new Error(`Failed to load conversations: ${error.message}`);
  return (data as ThreadPreviewRow[]).map(mapThreadPreview);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) throw new Error(`Failed to load unread count: ${error.message}`);
  return count ?? 0;
}

export async function findThreadId(listingId: number, buyerId: string): Promise<number | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("threads")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (error) throw new Error(`Failed to look up conversation: ${error.message}`);
  return data?.id ?? null;
}

export async function getThread(threadId: number, userId: string): Promise<Thread | null> {
  // Reuses thread_previews rather than embedding profiles through threads
  // directly -- threads.buyer_id/seller_id point at auth.users, not
  // profiles, so there's no FK path for PostgREST to embed through.
  const supabase = createClient();
  const { data, error } = await supabase
    .from("thread_previews")
    .select("*")
    .eq("thread_id", threadId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load conversation: ${error.message}`);
  if (!data) return null;

  const row = data as ThreadPreviewRow;
  if (row.buyer_id !== userId && row.seller_id !== userId) return null;

  return {
    id: row.thread_id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    listingTitle: row.listing_title,
    listingCat: row.listing_cat,
    listingTint: row.listing_tint,
    listingPhotos: row.listing_photos,
    otherHandle: row.buyer_id === userId ? row.seller_handle : row.buyer_handle,
  };
}

export async function getMessages(threadId: number): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load messages: ${error.message}`);
  return (data as MessageRow[]).map(mapMessage);
}
