export type Category =
  | "wheel"
  | "coilover"
  | "seat"
  | "exhaust"
  | "wing"
  | "turbo";

export type Profile = {
  id: string;
  handle: string;
  name: string;
  rating: number;
  sales: number;
  blurb: string;
  location: string;
  userId: string | null;
  usernameSet: boolean;
};

export type FitmentEntry = {
  id: number;
  universal: boolean;
  make: string | null;
  model: string | null;
  yearStart: number | null;
  yearEnd: number | null;
};

export type Vehicle = {
  year: number;
  make: string;
  model: string;
};

export type GarageVehicle = Vehicle & {
  id: number;
  trim: string | null;
  isPrimary: boolean;
};

export type Listing = {
  id: number;
  cat: Category;
  tint: string;
  title: string;
  price: number;
  cond: string;
  pn: string;
  description: string;
  specs: [string, string][];
  photos: string[];
  fitment: FitmentEntry[];
  seller: Profile;
};

export type Message = {
  id: number;
  threadId: number;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type ThreadPreview = {
  threadId: number;
  listingId: number;
  buyerId: string;
  sellerId: string;
  listingTitle: string;
  listingCat: Category;
  listingTint: string;
  listingPhotos: string[];
  buyerHandle: string;
  sellerHandle: string;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
};

export type Thread = {
  id: number;
  listingId: number;
  buyerId: string;
  sellerId: string;
  listingTitle: string;
  listingCat: Category;
  listingTint: string;
  listingPhotos: string[];
  otherHandle: string;
};
