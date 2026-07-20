export type Category =
  | "wheel"
  | "coilover"
  | "seat"
  | "exhaust"
  | "wing"
  | "turbo";

export type Seller = {
  id: string;
  handle: string;
  name: string;
  rating: number;
  sales: number;
  blurb: string;
  location: string;
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
  seller: Seller;
};
