-- AutoBridge: garage vehicles + structured listing fitment
-- Run this once in the Supabase SQL Editor, after 003 has already been run.

-- 1. Garage: each row is one vehicle a user owns. Private to that user --
--    this is personal data, not part of the public marketplace.
create table garage_vehicles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  make text not null,
  model text not null,
  trim text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

alter table garage_vehicles enable row level security;

create policy "Owner can read own garage" on garage_vehicles
  for select using (auth.uid() = user_id);
-- ^ garage entries are readable only by the user who owns them -- no public policy at all.

create policy "Owner can insert own garage" on garage_vehicles
  for insert with check (auth.uid() = user_id);
-- ^ you can only add a vehicle to your own garage.

create policy "Owner can update own garage" on garage_vehicles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- ^ same ownership check, for editing or changing which vehicle is primary.

create policy "Owner can delete own garage" on garage_vehicles
  for delete using (auth.uid() = user_id);
-- ^ same ownership check, for removing a vehicle.

-- Only one primary vehicle per user at a time (the one "FITS YOUR CAR" matches against).
create unique index garage_vehicles_one_primary
  on garage_vehicles (user_id) where is_primary;

-- 2. Listing fitment: structured, queryable tags -- replaces the old free-text
--    "fits" column, which couldn't be matched against a real garage vehicle.
--    A row is either universal (fits everything) or a specific make/model
--    with a year range (year_end nullable = still in production / open-ended).
create table listing_fitment (
  id bigint generated always as identity primary key,
  listing_id int not null references listings(id) on delete cascade,
  universal boolean not null default false,
  make text,
  model text,
  year_start int,
  year_end int,
  constraint listing_fitment_shape check (
    (universal and make is null and model is null and year_start is null and year_end is null)
    or
    (not universal and make is not null and model is not null and year_start is not null)
  )
);

alter table listing_fitment enable row level security;

create policy "Public read listing fitment" on listing_fitment
  for select using (true);
-- ^ anyone can see what a listing fits -- needed for the public browse/detail pages.

create policy "Owner can insert own listing fitment" on listing_fitment
  for insert with check (
    exists (
      select 1 from listings
      join profiles on profiles.id = listings.seller_id
      where listings.id = listing_fitment.listing_id and profiles.user_id = auth.uid()
    )
  );
-- ^ you can only tag fitment on a listing you own.

create policy "Owner can update own listing fitment" on listing_fitment
  for update using (
    exists (
      select 1 from listings
      join profiles on profiles.id = listings.seller_id
      where listings.id = listing_fitment.listing_id and profiles.user_id = auth.uid()
    )
  );
-- ^ same ownership check, for editing a fitment tag.

create policy "Owner can delete own listing fitment" on listing_fitment
  for delete using (
    exists (
      select 1 from listings
      join profiles on profiles.id = listings.seller_id
      where listings.id = listing_fitment.listing_id and profiles.user_id = auth.uid()
    )
  );
-- ^ same ownership check, for removing a fitment tag.

-- 3. Backfill: structured fitment for the 8 seed listings, derived from
--    their original free-text fitment descriptions.
insert into listing_fitment (listing_id, universal, make, model, year_start, year_end) values
  (1, false, 'Subaru', 'WRX', 2015, 2021),
  (1, false, 'Subaru', 'STI', 2015, 2021),
  (1, false, 'Subaru', 'WRX', 2008, 2014),
  (2, false, 'Subaru', 'WRX', 2015, 2021),
  (2, false, 'Subaru', 'STI', 2015, 2021),
  (3, true, null, null, null, null),
  (4, false, 'Subaru', 'WRX', 2015, 2021),
  (4, false, 'Subaru', 'STI', 2015, 2021),
  (4, true, null, null, null, null),
  (5, false, 'Subaru', 'WRX', 2015, 2021),
  (6, false, 'BMW', 'M3', 2021, null),
  (6, false, 'BMW', 'M4', 2021, null),
  (7, true, null, null, null, null),
  (8, false, 'Subaru', 'WRX', 2015, 2021),
  (8, false, 'Subaru', 'STI', 2015, 2021);

-- 4. Backfill: any listing with no fitment rows yet (the real listings from
--    session 3's sell flow, which didn't collect fitment at all) defaults to
--    universal so they don't silently disappear once fitment filtering goes
--    live. Sellers can edit their own listings afterward to set real fitment.
insert into listing_fitment (listing_id, universal)
select l.id, true
from listings l
where not exists (select 1 from listing_fitment lf where lf.listing_id = l.id);

-- 5. The old unstructured columns are fully superseded by listing_fitment;
--    drop them rather than leave unused, driftable data behind.
alter table listings drop column if exists fits;
alter table listings drop column if exists fits_my_car;
