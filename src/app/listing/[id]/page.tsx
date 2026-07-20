import { notFound } from "next/navigation";
import ListingDetail from "@/components/ListingDetail";
import { getListingById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const listing = await getListingById(id);
  if (!listing) notFound();

  return <ListingDetail listing={listing} />;
}
