import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingById } from "@/lib/data";
import ListingForm from "@/components/sell/ListingForm";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
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
  if (!user) redirect("/login");

  const listing = await getListingById(id);
  if (!listing) notFound();
  if (listing.seller.userId !== user.id) redirect("/profile");

  return <ListingForm sellerId={listing.seller.id} listing={listing} />;
}
