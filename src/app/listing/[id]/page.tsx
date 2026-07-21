import { notFound } from "next/navigation";
import ListingDetail from "@/components/ListingDetail";
import { createClient } from "@/lib/supabase/server";
import { getListingById, getPrimaryVehicle } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [listing, primaryVehicle] = await Promise.all([
    getListingById(id),
    user ? getPrimaryVehicle(user.id) : Promise.resolve(null),
  ]);
  if (!listing) notFound();

  return <ListingDetail listing={listing} primaryVehicle={primaryVehicle} />;
}
