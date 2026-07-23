"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase/client";

export function useLikes(userId: string | null, initialLikedIds: number[]) {
  const router = useRouter();
  const supabase = createClient();
  const [liked, setLiked] = useState<Set<number>>(() => new Set(initialLikedIds));

  function isLiked(listingId: number) {
    return liked.has(listingId);
  }

  async function toggle(listingId: number) {
    if (!userId) {
      router.push("/login");
      return;
    }

    const wasLiked = liked.has(listingId);
    setLiked((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(listingId);
      else next.add(listingId);
      return next;
    });

    const { error } = wasLiked
      ? await supabase.from("likes").delete().eq("user_id", userId).eq("listing_id", listingId)
      : await supabase.from("likes").insert({ user_id: userId, listing_id: listingId });

    if (error) {
      // Revert the optimistic update if the write failed.
      setLiked((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
    }
  }

  return { isLiked, toggle };
}
