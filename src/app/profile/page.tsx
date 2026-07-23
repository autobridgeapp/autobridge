import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProfileByUserId,
  getListingsBySeller,
  getLikedListings,
  getPrimaryVehicle,
} from "@/lib/data";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileByUserId(user.id);
  if (!profile) redirect("/login");
  if (!profile.usernameSet) redirect("/onboarding");

  const [listings, primaryVehicle, likedListings] = await Promise.all([
    getListingsBySeller(profile.id),
    getPrimaryVehicle(user.id),
    getLikedListings(user.id),
  ]);

  return (
    <ProfileView
      profile={profile}
      listings={listings}
      primaryVehicle={primaryVehicle}
      likedListings={likedListings}
      userId={user.id}
    />
  );
}
