-- AutoBridge schema + seed data
-- Run this once in your Supabase project's SQL Editor (Project -> SQL Editor -> New query -> paste -> Run)

create table if not exists sellers (
  id text primary key,
  handle text not null,
  name text not null,
  rating numeric not null,
  sales int not null,
  blurb text not null,
  location text not null
);

create table if not exists listings (
  id int primary key,
  cat text not null,
  tint text not null,
  title text not null,
  price int not null,
  cond text not null,
  pn text not null,
  seller_id text not null references sellers(id),
  fits text[] not null,
  fits_my_car boolean not null default false,
  description text not null,
  specs jsonb not null
);

alter table sellers enable row level security;
alter table listings enable row level security;

create policy "Public read sellers" on sellers for select using (true);
create policy "Public read listings" on listings for select using (true);

insert into sellers (id, handle, name, rating, sales, blurb, location) values
  ('parted_sd', 'parted_out_sd', 'Parted Out SD', 4.9, 212, 'Parting out clean SoCal enthusiast cars. Everything tested before it ships.', 'San Diego, CA'),
  ('wrxgrave', 'wrx_graveyard', 'WRX Graveyard', 4.8, 341, 'VA/GD/GR Subaru specialist. OEM+ takeoffs and hard-to-find trim.', 'Sacramento, CA'),
  ('trackday', 'trackday_takeoffs', 'Trackday Takeoffs', 5.0, 88, 'Fresh takeoffs from track builds. Low miles, no stories.', 'Phoenix, AZ'),
  ('eurobin', 'euro_bin', 'Euro Bin', 4.7, 156, 'BMW & VW performance parts. Ask for fitment help anytime.', 'Portland, OR')
on conflict (id) do nothing;

insert into listings (id, cat, tint, title, price, cond, pn, seller_id, fits, fits_my_car, description, specs) values
  (1, 'wheel', '#EDE9E1', 'Volk TE37 Saga 18x9.5 +38 (set of 4)', 2450, 'Used — 8/10', 'WVDSAG38EA', 'parted_sd',
    array['2015–2021 Subaru WRX / STI (VA)', '2008–2014 WRX (5x114.3 hub)', 'Most 5x114.3 / 18" clearance'], true,
    'Genuine Rays TE37 Saga in bronze. Light rash on one lip (pictured), no bends, no repairs. Balanced last month. Tires not included.',
    '[["Size","18x9.5"],["Offset","+38"],["Bolt pattern","5x114.3"],["Weight","18.7 lb"],["Finish","Bronze"]]'::jsonb),

  (2, 'coilover', '#E4E9EA', 'Öhlins Road & Track DFV coilovers', 1850, 'Used — 9/10', 'SUS MI21S1', 'wrxgrave',
    array['2015–2021 Subaru WRX / STI (VA)'], true,
    '~6k street miles. No leaks, adjusters turn freely. Includes camber plates and original hardware. Removed for a full air setup.',
    '[["Spring rate F","8 kg/mm"],["Spring rate R","7 kg/mm"],["Adjustment","Dual DFV"],["Includes","Camber plates"]]'::jsonb),

  (3, 'seat', '#EAE4E1', 'Recaro Pole Position (FIA) — pair', 1600, 'Used — 7/10', '070.77.0184', 'trackday',
    array['Universal — side-mount brackets required'], false,
    'FIA tags valid through 2027. Bolster wear on driver side, no tears. Sold as a pair with sliders. Brackets sold separately.',
    '[["Homologation","FIA 8855-1999"],["Shell","Fiberglass"],["Mount","Side"],["Tag valid","2027"]]'::jsonb),

  (4, 'wing', '#E5E8E2', 'APR GTC-300 carbon wing 67"', 900, 'Used — 9/10', 'AS-106728', 'trackday',
    array['2015–2021 Subaru WRX / STI (VA) — direct mount', 'Universal with flat trunk mounting'], true,
    'Real carbon, no cracks or delamination. Comes with trunk-specific mounts for VA chassis. Hardware included.',
    '[["Width","67 in"],["Material","Carbon fiber"],["Mounts","VA trunk"],["Adjustable","Yes"]]'::jsonb),

  (5, 'exhaust', '#E9E6EC', 'Tomei Expreme Ti catback (titanium)', 1100, 'Used — 8/10', 'TB6090-SB03C', 'wrxgrave',
    array['2015–2021 Subaru WRX (VA, FA20DIT)'], true,
    'Full titanium, burnt tips. Minor scuffs under the mid-pipe. All flanges straight, hangers intact. Loud — know what you''re buying.',
    '[["Material","Titanium"],["Piping","80mm"],["Weight","13.9 lb"],["Sound","Very loud"]]'::jsonb),

  (6, 'wheel', '#E3E7EB', 'BMW M3 (G80) OEM 826M wheels + tires', 1700, 'Used — 9/10', '36118093837', 'eurobin',
    array['2021+ BMW M3 (G80) / M4 (G82)', '5x112 BMW fitments w/ clearance'], false,
    'Staggered OEM takeoffs, ~2k miles. PS4S tires at 90%. Perfect winter-setup donor or OEM+ refresh.',
    '[["Front","18x9.5 +23"],["Rear","19x10.5 +40"],["Bolt pattern","5x112"],["Tires","PS4S 90%"]]'::jsonb),

  (7, 'turbo', '#ECE7E0', 'Garrett G25-660 turbo (fresh rebuild)', 1350, 'Refurb — 10/10', '877895-5003S', 'parted_sd',
    array['Universal — build dependent (T25 inlet)'], false,
    'Rebuilt by Garrett-authorized shop, receipts included. Zero shaft play. Great base for a 450–500whp build.',
    '[["Rating","350–660 hp"],["Inlet","T25"],["Wastegate","External"],["Receipts","Included"]]'::jsonb),

  (8, 'seat', '#E6EAE4', 'OEM WRX STI front seats (VA, black/red)', 650, 'Used — 8/10', '64010VA010', 'wrxgrave',
    array['2015–2021 Subaru WRX / STI (VA) — plug and play'], true,
    'Clean STI takeoffs, airbags intact, no rips. Direct swap into any VA chassis with factory harness.',
    '[["Chassis","VA"],["Airbags","Intact"],["Harness","Plug & play"],["Color","Black / red"]]'::jsonb)
on conflict (id) do nothing;
