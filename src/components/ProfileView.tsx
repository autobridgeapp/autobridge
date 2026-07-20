"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Listing, Profile } from "@/lib/types";
import { MY_CAR } from "@/lib/constants";
import PartArt from "./PartArt";
import Price from "./Price";
import SignOutButton from "./auth/SignOutButton";

const SUBTABS = [
  ["shop", "My shop"],
  ["sold", "Sold"],
  ["purchases", "Purchases"],
  ["likes", "Likes"],
] as const;

type SubTab = (typeof SUBTABS)[number][0];

export default function ProfileView({
  profile,
  listings,
}: {
  profile: Profile;
  listings: Listing[];
}) {
  const router = useRouter();
  const [sub, setSub] = useState<SubTab>("shop");

  return (
    <div className="pb-6">
      <div className="pt-[18px] px-4 flex gap-3.5 items-center">
        <div className="w-[62px] h-[62px] rounded-full bg-accent text-white flex items-center justify-center font-extrabold text-2xl flex-shrink-0">
          {profile.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-lg">@{profile.handle}</div>
          <div className="text-[13px] text-muted">
            ★ {profile.rating} · {profile.sales} sales
            {profile.location ? ` · ${profile.location}` : ""}
          </div>
        </div>
        <SignOutButton />
      </div>

      <div className="mx-4 mt-3.5 bg-ink text-white rounded-xl px-3.5 py-3 flex justify-between items-center">
        <div>
          <div className="font-mono text-[9px] tracking-widest text-[#9a9a94]">
            MY GARAGE
          </div>
          <div className="font-extrabold text-sm mt-0.5">{MY_CAR.label}</div>
        </div>
        <span className="font-mono text-[10px] text-fit">FITMENT ACTIVE ●</span>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3.5 pb-3">
        {SUBTABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className="border-none cursor-pointer whitespace-nowrap px-3.5 py-2 rounded-lg text-[13px] font-display font-bold"
            style={{
              background: sub === id ? "#101112" : "#fff",
              color: sub === id ? "#fff" : "#101112",
              boxShadow: sub === id ? "none" : "inset 0 0 0 1px #E4E4DF",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "shop" && (
        <div className="px-4">
          <div className="flex gap-2.5 mb-3">
            {[
              [String(listings.length), "active"],
              ["0", "sold"],
              ["$0", "earned"],
            ].map(([v, k]) => (
              <div
                key={k}
                className="flex-1 bg-white rounded-[10px] ring-1 ring-cardline py-2.5 text-center"
              >
                <div className="font-extrabold text-base">{v}</div>
                <div className="font-mono text-[9px] tracking-widest text-muted mt-0.5">
                  {k.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {listings.map((l) => (
              <div
                key={l.id}
                onClick={() => router.push(`/listing/${l.id}`)}
                className="cursor-pointer bg-white rounded-[14px] overflow-hidden ring-1 ring-cardline"
              >
                <div
                  className="flex items-center justify-center"
                  style={{ background: l.tint, aspectRatio: "1.15" }}
                >
                  <div className="w-[60%]">
                    <PartArt cat={l.cat} />
                  </div>
                </div>
                <div className="px-2.5 pt-2.5 pb-2.5">
                  <div className="text-xs font-semibold leading-tight">{l.title}</div>
                  <div className="mt-1.5">
                    <Price value={l.price} size={14} />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => router.push("/sell")}
              className="border-2 border-dashed border-[#C9C9C2] bg-transparent rounded-[14px] cursor-pointer min-h-[150px] flex flex-col items-center justify-center gap-1.5 text-muted"
            >
              <span className="text-2xl font-light">+</span>
              <span className="text-xs font-bold">New listing</span>
            </button>
          </div>
        </div>
      )}

      {sub === "sold" && <EmptyState text="Nothing sold yet." />}
      {sub === "purchases" && <EmptyState text="Nothing purchased yet." />}
      {sub === "likes" && (
        <EmptyState text="Nothing liked yet. Tap the ♥ on any part to save it here." />
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-10 px-5 text-muted text-sm leading-relaxed">
      {text}
    </div>
  );
}
