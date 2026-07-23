import BrowseFeed from "@/components/BrowseFeed";
import { createClient } from "@/lib/supabase/server";
import { getLikedListingIds, getListings, getPrimaryVehicle } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [listings, primaryVehicle, likedIds] = await Promise.all([
    getListings(),
    user ? getPrimaryVehicle(user.id) : Promise.resolve(null),
    user ? getLikedListingIds(user.id) : Promise.resolve(new Set<number>()),
  ]);

  return (
    <BrowseFeed
      listings={listings}
      primaryVehicle={primaryVehicle}
      userId={user?.id ?? null}
      initialLikedIds={Array.from(likedIds)}
    />
  );
}
