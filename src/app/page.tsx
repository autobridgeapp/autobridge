import BrowseFeed from "@/components/BrowseFeed";
import { createClient } from "@/lib/supabase/server";
import { getListings, getPrimaryVehicle } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [listings, primaryVehicle] = await Promise.all([
    getListings(),
    user ? getPrimaryVehicle(user.id) : Promise.resolve(null),
  ]);

  return <BrowseFeed listings={listings} primaryVehicle={primaryVehicle} />;
}
