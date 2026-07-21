"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Listing, Profile, Vehicle } from "@/lib/types";
import { formatVehicleLabel } from "@/lib/fitment";
import { createClient } from "@/lib/supabase/client";
import { LISTING_PHOTOS_BUCKET, storagePathFromUrl } from "@/lib/storage";
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
  primaryVehicle,
}: {
  profile: Profile;
  listings: Listing[];
  primaryVehicle: Vehicle | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [sub, setSub] = useState<SubTab>("shop");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(l: Listing) {
    if (!window.confirm(`Delete "${l.title}"? This can't be undone.`)) return;

    setDeletingId(l.id);
    try {
      const paths = l.photos
        .map(storagePathFromUrl)
        .filter((p): p is string => p !== null);
      if (paths.length > 0) {
        await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(paths);
      }
      const { error } = await supabase.from("listings").delete().eq("id", l.id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete listing.");
    } finally {
      setDeletingId(null);
    }
  }

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

      <div className="px-4 mt-3.5">
        <button
          onClick={() => router.push("/garage")}
          className="w-full text-left bg-ink text-white rounded-xl px-3.5 py-3 flex justify-between items-center border-none cursor-pointer"
        >
          <div>
            <div className="font-mono text-[9px] tracking-widest text-[#9a9a94]">
              MY GARAGE
            </div>
            <div className="font-extrabold text-sm mt-0.5">
              {primaryVehicle ? formatVehicleLabel(primaryVehicle) : "Add a vehicle"}
            </div>
          </div>
          {primaryVehicle ? (
            <span className="font-mono text-[10px] text-fit">FITMENT ACTIVE ●</span>
          ) : (
            <span className="font-mono text-[10px] text-[#9a9a94]">MANAGE ›</span>
          )}
        </button>
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
                className="bg-white rounded-[14px] overflow-hidden ring-1 ring-cardline"
              >
                <div
                  onClick={() => router.push(`/listing/${l.id}`)}
                  className="flex items-center justify-center relative cursor-pointer"
                  style={{ background: l.tint, aspectRatio: "1.15" }}
                >
                  {l.photos.length > 0 ? (
                    <Image
                      src={l.photos[0]}
                      alt={l.title}
                      fill
                      sizes="(max-width: 400px) 50vw, 200px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-[60%]">
                      <PartArt cat={l.cat} />
                    </div>
                  )}
                </div>
                <div className="px-2.5 pt-2.5 pb-2.5">
                  <div className="text-xs font-semibold leading-tight">{l.title}</div>
                  <div className="mt-1.5">
                    <Price value={l.price} size={14} />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => router.push(`/sell/edit/${l.id}`)}
                      className="flex-1 py-1.5 rounded-md border-none cursor-pointer bg-bg text-[11px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(l)}
                      disabled={deletingId === l.id}
                      className="flex-1 py-1.5 rounded-md border-none cursor-pointer bg-bg text-accent text-[11px] font-bold disabled:opacity-50"
                    >
                      {deletingId === l.id ? "…" : "Delete"}
                    </button>
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
