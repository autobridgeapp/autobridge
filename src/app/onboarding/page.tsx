import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/data";
import OnboardingForm from "@/components/auth/OnboardingForm";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileByUserId(user.id);
  if (!profile) redirect("/login");
  if (profile.usernameSet) redirect("/profile");

  return <OnboardingForm />;
}
