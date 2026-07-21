"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Listing, Vehicle } from "@/lib/types";
import { listingFitsVehicle, formatVehicleShort } from "@/lib/fitment";
import PartArt from "./PartArt";
import FitBadge from "./FitBadge";
import Heart from "./Heart";
import Price from "./Price";

export default function Card({
  listing,
  liked,
  toggleLike,
  primaryVehicle,
}: {
  listing: Listing;
  liked: boolean;
  toggleLike: () => void;
  primaryVehicle: Vehicle | null;
}) {
  const router = useRouter();
  const fits = primaryVehicle ? listingFitsVehicle(listing.fitment, primaryVehicle) : false;

  return (
    <div
      onClick={() => router.push(`/listing/${listing.id}`)}
      className="cursor-pointer bg-white rounded-[14px] overflow-hidden shadow-[0_1px_2px_rgba(16,17,18,0.06)] ring-1 ring-cardline"
    >
      <div
        className="aspect-square flex items-center justify-center relative"
        style={{ background: listing.tint }}
      >
        {listing.photos.length > 0 ? (
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            sizes="(max-width: 400px) 50vw, 200px"
            className="object-cover"
          />
        ) : (
          <div className="w-[68%]">
            <PartArt cat={listing.cat} />
          </div>
        )}
        {fits && primaryVehicle && (
          <div className="absolute top-2 left-2">
            <FitBadge compact vehicleLabel={formatVehicleShort(primaryVehicle)} />
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <Heart filled={liked} onClick={toggleLike} />
        </div>
      </div>
      <div className="px-[11px] pt-[10px] pb-3">
        <div className="text-[12.5px] font-semibold leading-tight min-h-[33px]">
          {listing.title}
        </div>
        <div className="flex justify-between items-baseline mt-1.5">
          <Price value={listing.price} size={15} />
          <span className="font-mono text-muted" style={{ fontSize: 9.5 }}>
            {listing.cond.split(" — ")[1]}
          </span>
        </div>
        <div className="text-[11px] text-muted mt-1">
          @{listing.seller.handle}
        </div>
      </div>
    </div>
  );
}
