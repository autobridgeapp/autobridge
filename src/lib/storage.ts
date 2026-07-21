export const LISTING_PHOTOS_BUCKET = "listing-photos";

export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${LISTING_PHOTOS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
