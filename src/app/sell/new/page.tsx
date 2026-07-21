import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/data";
import ListingForm from "@/components/sell/ListingForm";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileByUserId(user.id);
  if (!profile) redirect("/login");
  if (!profile.usernameSet) redirect("/onboarding");

  return <ListingForm sellerId={profile.id} />;
}
