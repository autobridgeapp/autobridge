import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGarage } from "@/lib/data";
import GarageManager from "@/components/garage/GarageManager";

export const dynamic = "force-dynamic";

export default async function GaragePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const vehicles = await getGarage(user.id);

  return <GarageManager userId={user.id} vehicles={vehicles} />;
}
