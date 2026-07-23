"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Listing, Vehicle } from "@/lib/types";
import { listingFitsVehicle, formatVehicleShort, formatFitmentEntry } from "@/lib/fitment";
import { useLikes } from "@/lib/useLikes";
import { createClient } from "@/lib/supabase/client";
import PartArt from "./PartArt";
import FitBadge from "./FitBadge";
import Heart from "./Heart";
import Price from "./Price";

export default function ListingDetail({
  listing,
  primaryVehicle,
  currentUserId,
  initiallyLiked,
}: {
  listing: Listing;
  primaryVehicle: Vehicle | null;
  currentUserId: string | null;
  initiallyLiked: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { isLiked, toggle: toggleLike } = useLikes(
    currentUserId,
    initiallyLiked ? [listing.id] : []
  );
  const [activePhoto, setActivePhoto] = useState(0);
  const [startingThread, setStartingThread] = useState(false);
  const s = listing.seller;
  const photos = listing.photos;
  const fits = primaryVehicle ? listingFitsVehicle(listing.fitment, primaryVehicle) : false;
  const canMessageSeller =
    !!s.userId && s.userId !== currentUserId;

  async function handleMessageSeller() {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    setStartingThread(true);
    try {
      const { data: existing, error: findError } = await supabase
        .from("threads")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("buyer_id", currentUserId)
        .maybeSingle();
      if (findError) throw findError;

      if (existing) {
        router.push(`/inbox/${existing.id}`);
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("threads")
        .insert({ listing_id: listing.id, buyer_id: currentUserId, seller_id: s.userId })
        .select("id")
        .single();
      if (createError) throw createError;

      router.push(`/inbox/${created.id}`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to start conversation.");
    } finally {
      setStartingThread(false);
    }
  }

  return (
    <div className="pb-[90px] relative">
      <div
        className="aspect-[4/3] flex items-center justify-center relative"
        style={{ background: listing.tint }}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 w-[34px] h-[34px] rounded-full border-none bg-white/90 cursor-pointer text-base font-bold z-10"
        >
          ←
        </button>
        <div className="absolute top-3 right-3 z-10">
          <Heart filled={isLiked(listing.id)} onClick={() => toggleLike(listing.id)} size={34} />
        </div>
        {photos.length > 0 ? (
          <Image
            src={photos[activePhoto]}
            alt={listing.title}
            fill
            sizes="400px"
            className="object-cover"
          />
        ) : (
          <div className="w-1/2">
            <PartArt cat={listing.cat} />
          </div>
        )}
        <span className="font-mono absolute bottom-2.5 right-3 text-[9px] text-muted">
          {photos.length > 0 ? `PHOTOS ${activePhoto + 1}/${photos.length}` : "PROTOTYPE ART"}
        </span>
      </div>
      {photos.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5 bg-bg">
          {photos.map((url, i) => (
            <button
              key={url}
              onClick={() => setActivePhoto(i)}
              className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-none cursor-pointer p-0"
              style={{ boxShadow: i === activePhoto ? "inset 0 0 0 2px #FF4400" : "inset 0 0 0 1px #E4E4DF" }}
            >
              <Image src={url} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="px-4 pt-4">
        {fits && primaryVehicle && <FitBadge vehicleLabel={formatVehicleShort(primaryVehicle)} />}
        <h2 className="text-[19px] font-extrabold mt-2.5 mb-1 leading-tight">
          {listing.title}
        </h2>
        <div className="flex gap-2.5 items-baseline">
          <Price value={listing.price} size={22} />
          <span className="text-[13px] text-muted">{listing.cond}</span>
        </div>
        <div className="font-mono text-[11px] text-muted mt-1">
          P/N {listing.pn}
        </div>

        {listing.fitment.length > 0 && (
          <div className="mt-4 bg-white rounded-xl ring-1 ring-cardline overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-cardline flex justify-between items-center">
              <span className="font-mono text-[10px] tracking-widest text-muted">
                VERIFIED FITMENT
              </span>
              <span className="w-2 h-2 rounded-full bg-fit" />
            </div>
            {listing.fitment.map((f, i) => {
              const rowMatches = primaryVehicle ? listingFitsVehicle([f], primaryVehicle) : false;
              return (
                <div
                  key={f.id}
                  className="px-3.5 py-2.5 text-[13.5px]"
                  style={{
                    borderBottom:
                      i < listing.fitment.length - 1 ? "1px solid #F3F3EF" : "none",
                    fontWeight: rowMatches ? 700 : 400,
                  }}
                >
                  {formatFitmentEntry(f)}
                </div>
              );
            })}
          </div>
        )}

        {listing.specs.length > 0 && (
          <div className="mt-3 bg-white rounded-xl ring-1 ring-cardline px-3.5">
            {listing.specs.map(([k, v], i) => (
              <div
                key={k}
                className="flex justify-between py-2.5 text-[13.5px]"
                style={{
                  borderBottom:
                    i < listing.specs.length - 1 ? "1px solid #F3F3EF" : "none",
                }}
              >
                <span className="text-muted">{k}</span>
                <span className="font-mono text-xs font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm leading-relaxed text-muted2 mt-3.5">
          {listing.description}
        </p>

        <div className="w-full text-left mt-2 flex items-center gap-3 bg-white rounded-xl ring-1 ring-cardline p-3">
          <div className="w-[42px] h-[42px] rounded-full bg-ink text-white flex items-center justify-center font-extrabold text-[15px]">
            {s.name[0]}
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">@{s.handle}</div>
            <div className="text-xs text-muted">
              ★ {s.rating} · {s.sales} sales · {s.location}
            </div>
          </div>
          {canMessageSeller && (
            <button
              onClick={handleMessageSeller}
              disabled={startingThread}
              className="flex-shrink-0 rounded-lg px-3 py-2 text-xs font-bold bg-bg disabled:opacity-50 border-none cursor-pointer"
            >
              {startingThread ? "…" : "Message"}
            </button>
          )}
        </div>
      </div>
      <div
        className="absolute left-0 right-0 bottom-0 px-4 pt-3 pb-4 flex gap-2.5"
        style={{ background: "linear-gradient(transparent, #F5F5F2 30%)" }}
      >
        <button className="flex-1 py-3.5 rounded-xl border-none cursor-pointer bg-accent text-white font-extrabold text-sm">
          Buy now
        </button>
      </div>
    </div>
  );
}
