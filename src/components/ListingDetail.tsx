"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Listing } from "@/lib/types";
import PartArt from "./PartArt";
import FitBadge from "./FitBadge";
import Heart from "./Heart";
import Price from "./Price";

export default function ListingDetail({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [offerSent, setOfferSent] = useState(false);
  const s = listing.seller;

  return (
    <div className="pb-[90px] relative">
      <div
        className="aspect-[4/3] flex items-center justify-center relative"
        style={{ background: listing.tint }}
      >
        <button
          onClick={() => router.back()}
          className="absolute top-3 left-3 w-[34px] h-[34px] rounded-full border-none bg-white/90 cursor-pointer text-base font-bold"
        >
          ←
        </button>
        <div className="absolute top-3 right-3">
          <Heart filled={liked} onClick={() => setLiked((v) => !v)} size={34} />
        </div>
        <div className="w-1/2">
          <PartArt cat={listing.cat} />
        </div>
        <span className="font-mono absolute bottom-2.5 right-3 text-[9px] text-muted">
          PHOTOS 1/6 · PROTOTYPE ART
        </span>
      </div>
      <div className="px-4 pt-4">
        {listing.fitsMyCar && <FitBadge />}
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

        <div className="mt-4 bg-white rounded-xl ring-1 ring-cardline overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-cardline flex justify-between items-center">
            <span className="font-mono text-[10px] tracking-widest text-muted">
              VERIFIED FITMENT
            </span>
            <span className="w-2 h-2 rounded-full bg-fit" />
          </div>
          {listing.fits.map((f, i) => (
            <div
              key={i}
              className="px-3.5 py-2.5 text-[13.5px]"
              style={{
                borderBottom:
                  i < listing.fits.length - 1 ? "1px solid #F3F3EF" : "none",
                fontWeight: f.includes("WRX") && listing.fitsMyCar ? 700 : 400,
              }}
            >
              {f}
            </div>
          ))}
        </div>

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
        </div>
      </div>
      <div
        className="absolute left-0 right-0 bottom-0 px-4 pt-3 pb-4 flex gap-2.5"
        style={{ background: "linear-gradient(transparent, #F5F5F2 30%)" }}
      >
        <button
          onClick={() => setOfferSent(true)}
          className="flex-1 py-3.5 rounded-xl border-none cursor-pointer bg-white font-extrabold text-sm"
          style={{ boxShadow: "inset 0 0 0 1.5px #101112" }}
        >
          {offerSent ? "Offer sent ✓" : "Make offer"}
        </button>
        <button className="flex-1 py-3.5 rounded-xl border-none cursor-pointer bg-accent text-white font-extrabold text-sm">
          Buy now
        </button>
      </div>
    </div>
  );
}
