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

export type Listing = {
  id: number;
  cat: Category;
  tint: string;
  title: string;
  price: number;
  cond: string;
  pn: string;
  fits: string[];
  fitsMyCar: boolean;
  description: string;
  specs: [string, string][];
  seller: Profile;
};
