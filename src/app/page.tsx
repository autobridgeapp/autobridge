import BrowseFeed from "@/components/BrowseFeed";
import { getListings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const listings = await getListings();
  return <BrowseFeed listings={listings} />;
}
