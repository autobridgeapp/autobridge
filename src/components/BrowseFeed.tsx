"use client";

import { useMemo, useState } from "react";
import { Listing } from "@/lib/types";
import { CATS, MY_CAR } from "@/lib/constants";
import Card from "./Card";

export default function BrowseFeed({ listings }: { listings: Listing[] }) {
  const [fitOnly, setFitOnly] = useState(false);
  const [cat, setCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const results = useMemo(() => {
    return listings.filter((l) => {
      if (fitOnly && !l.fitsMyCar) return false;
      if (cat !== "all" && l.cat !== cat) return false;
      if (query && !l.title.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [listings, fitOnly, cat, query]);

  return (
    <div>
      <div className="px-4 pt-3 pb-1">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parts, brands, part numbers"
          className="w-full box-border px-3.5 py-3 rounded-[10px] border border-line bg-white text-sm font-display outline-none"
        />
      </div>
      <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5">
        <button
          onClick={() => setFitOnly(!fitOnly)}
          className="flex items-center gap-2 border-none cursor-pointer rounded-full px-3.5 py-2 font-display font-bold text-[13px]"
          style={{
            background: fitOnly ? "#101112" : "#fff",
            color: fitOnly ? "#fff" : "#101112",
            boxShadow: fitOnly ? "none" : "inset 0 0 0 1px #E4E4DF",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-fit inline-block" />
          {MY_CAR.label}
          <span className="font-mono text-[10px] font-normal opacity-60">
            {fitOnly ? "FITMENT ON" : "SHOW ALL"}
          </span>
        </button>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3.5">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className="border-none cursor-pointer whitespace-nowrap px-[13px] py-[7px] rounded-lg text-[13px] font-display font-semibold"
            style={{
              background: cat === c.id ? "#FF4400" : "#fff",
              color: cat === c.id ? "#fff" : "#101112",
              boxShadow: cat === c.id ? "none" : "inset 0 0 0 1px #E4E4DF",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        {results.map((l) => (
          <Card
            key={l.id}
            listing={l}
            liked={liked.has(l.id)}
            toggleLike={() => toggleLike(l.id)}
          />
        ))}
        {results.length === 0 && (
          <div className="col-span-2 text-center py-10 px-5 text-muted text-sm">
            No parts match. Turn off the fitment filter or try another
            search.
          </div>
        )}
      </div>
    </div>
  );
}
