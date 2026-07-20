import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId, getListingsBySeller } from "@/lib/data";
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

  const listings = await getListingsBySeller(profile.id);

  return <ProfileView profile={profile} listings={listings} />;
}
