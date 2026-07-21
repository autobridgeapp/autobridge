-- AutoBridge: real listings -- photos, auto-increment ids, and Storage RLS
-- Run this once in the Supabase SQL Editor, after 002 has already been run.

-- 1. Photos: array of public Storage URLs. Seed listings keep an empty array
--    and fall back to the illustrated SVG placeholder in the UI.
alter table listings add column if not exists photos text[] not null default '{}';

-- 2. New real listings need auto-generated ids -- the seed rows were inserted
--    with explicit ids 1-8 and no sequence, so the next insert would collide.
--    This creates a sequence starting after the highest existing id and wires
--    it up as the column default, without touching any existing rows.
create sequence if not exists listings_id_seq owned by listings.id;
select setval('listings_id_seq', (select max(id) from listings));
alter table listings alter column id set default nextval('listings_id_seq');

-- 3. Sensible defaults for fields the sell form doesn't collect yet (fitment
--    data entry is a future feature) so inserts can omit them.
alter table listings alter column tint set default '#EDEDE7';
alter table listings alter column fits set default '{}';
alter table listings alter column fits_my_car set default false;
alter table listings alter column specs set default '[]'::jsonb;

-- 4. Storage bucket for listing photos. Public bucket so photos load via a
--    plain public URL on the feed/detail pages without signed-URL overhead.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- 5. RLS on storage.objects, scoped to this bucket only. Upload path
--    convention is "{auth.uid()}/{filename}", so ownership is just checking
--    the first path segment matches the caller's own id.
create policy "Public read listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');
-- ^ anyone can view listing photos (needed for the public browse feed);
--   redundant with the public bucket flag but kept explicit per policy.

create policy "Owner can upload own listing photos"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
-- ^ you can only upload into a folder named after your own user id.

create policy "Owner can update own listing photos"
  on storage.objects for update
  using (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
-- ^ same ownership check, for replacing a file at the same path.

create policy "Owner can delete own listing photos"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
-- ^ same ownership check, for removing a photo.
