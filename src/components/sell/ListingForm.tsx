"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";
import { LISTING_PHOTOS_BUCKET, storagePathFromUrl } from "@/lib/storage";
import { Category, Listing } from "@/lib/types";
import FitmentRow, { FitmentRowState } from "./FitmentRow";

const CAT_OPTIONS: { id: Category; label: string }[] = [
  { id: "wheel", label: "Wheels" },
  { id: "coilover", label: "Suspension" },
  { id: "seat", label: "Seats" },
  { id: "exhaust", label: "Exhaust" },
  { id: "wing", label: "Aero" },
  { id: "turbo", label: "Forced induction" },
];

const COND_LABELS = ["New", "Used", "Refurb"] as const;
const MAX_PHOTOS = 6;

const inputClass =
  "w-full box-border px-3.5 py-3 rounded-[10px] border border-line bg-white text-sm font-display outline-none";

type NewPhoto = { file: File; previewUrl: string };

function parseCond(cond: string): { label: string; rating: string } {
  const [label, ratingPart] = cond.split(" — ");
  const rating = ratingPart?.replace("/10", "") ?? "8";
  return { label: label ?? "Used", rating };
}

const DEFAULT_FITMENT_ROW: FitmentRowState = {
  universal: true,
  yearStart: "",
  yearEnd: "",
  make: "",
  model: "",
};

function initialFitmentRows(listing?: Listing): FitmentRowState[] {
  if (!listing || listing.fitment.length === 0) return [DEFAULT_FITMENT_ROW];
  return listing.fitment.map((f) => ({
    universal: f.universal,
    yearStart: f.yearStart !== null ? String(f.yearStart) : "",
    yearEnd: f.yearEnd !== null ? String(f.yearEnd) : "",
    make: f.make ?? "",
    model: f.model ?? "",
  }));
}

export default function ListingForm({
  sellerId,
  listing,
}: {
  sellerId: string;
  listing?: Listing;
}) {
  const router = useRouter();
  const supabase = createClient();
  const initialCond = listing ? parseCond(listing.cond) : { label: "Used", rating: "8" };

  const [cat, setCat] = useState<Category>(listing?.cat ?? "wheel");
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [price, setPrice] = useState(listing ? String(listing.price) : "");
  const [condLabel, setCondLabel] = useState(initialCond.label);
  const [condRating, setCondRating] = useState(initialCond.rating);
  const [pn, setPn] = useState(listing?.pn ?? "");
  const [existingPhotos, setExistingPhotos] = useState<string[]>(listing?.photos ?? []);
  const [newFiles, setNewFiles] = useState<NewPhoto[]>([]);
  const [fitmentRows, setFitmentRows] = useState<FitmentRowState[]>(() => initialFitmentRows(listing));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalPhotos = existingPhotos.length + newFiles.length;

  useEffect(() => {
    return () => {
      newFiles.forEach((nf) => URL.revokeObjectURL(nf.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const room = MAX_PHOTOS - totalPhotos;
    const accepted = picked.slice(0, room).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewFiles((prev) => [...prev, ...accepted]);
    e.target.value = "";
  }

  function removeExisting(url: string) {
    setExistingPhotos((prev) => prev.filter((u) => u !== url));
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateFitmentRow(index: number, next: FitmentRowState) {
    setFitmentRows((prev) => prev.map((r, i) => (i === index ? next : r)));
  }

  function addFitmentRow() {
    setFitmentRows((prev) => [
      ...prev,
      { universal: false, yearStart: "", yearEnd: "", make: "", model: "" },
    ]);
  }

  function removeFitmentRow(index: number) {
    setFitmentRows((prev) => prev.filter((_, i) => i !== index));
  }

  function validateFitment(): string | null {
    for (const r of fitmentRows) {
      if (r.universal) continue;
      if (!r.yearStart || !r.make || !r.model) {
        return "Each specific fitment needs a year, make, and model (or check Universal).";
      }
    }
    return null;
  }

  function buildFitmentPayload(listingId: number) {
    return fitmentRows.map((r) =>
      r.universal
        ? {
            listing_id: listingId,
            universal: true,
            make: null,
            model: null,
            year_start: null,
            year_end: null,
          }
        : {
            listing_id: listingId,
            universal: false,
            make: r.make,
            model: r.model,
            year_start: Number(r.yearStart),
            year_end: r.yearEnd ? Number(r.yearEnd) : null,
          }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    const ratingNum = Number(condRating);
    if (!title.trim()) return setError("Title is required.");
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError("Enter a valid price.");
    if (!pn.trim()) return setError("Part number is required.");
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 10)
      return setError("Condition rating must be 1-10.");
    const fitmentError = validateFitment();
    if (fitmentError) return setError(fitmentError);

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Your session expired. Please sign in again.");

      const uploadedUrls: string[] = [];
      for (const { file } of newFiles) {
        const blob = await compressImage(file);
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(LISTING_PHOTOS_BUCKET)
          .upload(path, blob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from(LISTING_PHOTOS_BUCKET)
          .getPublicUrl(path);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const photos = [...existingPhotos, ...uploadedUrls];
      const cond = `${condLabel} — ${ratingNum}/10`;

      if (listing) {
        const removedUrls = listing.photos.filter((u) => !existingPhotos.includes(u));
        const removedPaths = removedUrls
          .map(storagePathFromUrl)
          .filter((p): p is string => p !== null);
        if (removedPaths.length > 0) {
          await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(removedPaths);
        }

        const { error: updateError } = await supabase
          .from("listings")
          .update({ cat, title, description, price: priceNum, cond, pn, photos })
          .eq("id", listing.id);
        if (updateError) throw updateError;

        const { error: deleteFitmentError } = await supabase
          .from("listing_fitment")
          .delete()
          .eq("listing_id", listing.id);
        if (deleteFitmentError) throw deleteFitmentError;

        const { error: fitmentError } = await supabase
          .from("listing_fitment")
          .insert(buildFitmentPayload(listing.id));
        if (fitmentError) throw fitmentError;

        router.push(`/listing/${listing.id}`);
        router.refresh();
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("listings")
          .insert({
            cat,
            title,
            description,
            price: priceNum,
            cond,
            pn,
            photos,
            seller_id: sellerId,
          })
          .select("id")
          .single();
        if (insertError) throw insertError;

        const { error: fitmentError } = await supabase
          .from("listing_fitment")
          .insert(buildFitmentPayload(inserted.id));
        if (fitmentError) throw fitmentError;

        router.push(`/listing/${inserted.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-4 pb-8 flex flex-col gap-3">
      <div>
        <label className="text-xs font-bold text-muted mb-1 block">Category</label>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as Category)}
          className={inputClass}
        >
          {CAT_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-muted mb-1 block">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Volk TE37 Saga 18x9.5 +38 (set of 4)"
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-muted mb-1 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Condition details, wear, what's included..."
          rows={4}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-bold text-muted mb-1 block">Price (USD)</label>
          <input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="450"
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-muted mb-1 block">Part number</label>
          <input
            value={pn}
            onChange={(e) => setPn(e.target.value)}
            placeholder="WVDSAG38EA"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-bold text-muted mb-1 block">Condition</label>
          <select
            value={condLabel}
            onChange={(e) => setCondLabel(e.target.value)}
            className={inputClass}
          >
            {COND_LABELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="w-24">
          <label className="text-xs font-bold text-muted mb-1 block">Rating /10</label>
          <input
            type="number"
            min={1}
            max={10}
            value={condRating}
            onChange={(e) => setCondRating(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-muted mb-1 block">Fitment</label>
        <div className="flex flex-col gap-2">
          {fitmentRows.map((row, i) => (
            <FitmentRow
              key={i}
              value={row}
              onChange={(next) => updateFitmentRow(i, next)}
              onRemove={() => removeFitmentRow(i)}
              canRemove={fitmentRows.length > 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addFitmentRow}
          className="mt-2 border-none bg-transparent cursor-pointer text-xs font-bold text-ink"
        >
          + Add another fitment
        </button>
      </div>

      <div>
        <label className="text-xs font-bold text-muted mb-1 block">
          Photos ({totalPhotos}/{MAX_PHOTOS})
        </label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {existingPhotos.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-cardline">
              {/* eslint-disable-next-line @next/next/no-img-element -- already-uploaded photo, plain img avoids re-optimizing a remote URL in a form-only preview */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink text-white text-xs leading-none border-none cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          {newFiles.map((nf, i) => (
            <div key={nf.previewUrl} className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-cardline">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote image next/image can optimize */}
              <img
                src={nf.previewUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink text-white text-xs leading-none border-none cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
          {totalPhotos < MAX_PHOTOS && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-[#C9C9C2] flex items-center justify-center cursor-pointer text-muted text-2xl font-light">
              +
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddFiles}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-accent">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-1 py-3.5 rounded-xl border-none cursor-pointer bg-accent text-white font-extrabold text-sm disabled:opacity-60"
      >
        {loading
          ? listing
            ? "Saving…"
            : "Publishing…"
          : listing
            ? "Save changes"
            : "Publish listing"}
      </button>
    </form>
  );
}
