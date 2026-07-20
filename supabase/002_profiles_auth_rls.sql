-- AutoBridge: profiles + auth + RLS lockdown
-- Run this once in the Supabase SQL Editor, after 001 (schema.sql) has already been run.

-- 1. sellers becomes profiles: every authenticated user gets a row here,
--    and it's the same shape the app already uses for shop identity.
alter table sellers rename to profiles;

alter table profiles
  add column if not exists user_id uuid unique references auth.users(id) on delete cascade;

alter table profiles
  add column if not exists username_set boolean not null default true;

alter table profiles
  add constraint profiles_handle_unique unique (handle);

alter table profiles alter column rating set default 5.0;
alter table profiles alter column sales set default 0;
alter table profiles alter column blurb set default '';
alter table profiles alter column location set default '';

-- 2. Auto-create a profile row whenever someone signs up (email/password or Google).
--    Email/password signup passes a chosen username in the signup call's metadata,
--    so username_set is true immediately. Google sign-in has no such form, so we
--    stamp a placeholder handle and mark username_set = false -- the app forces
--    those users through a one-time "choose your username" screen before they can
--    do anything else. A duplicate username raises a unique-violation here, which
--    rolls back the whole signup transaction, so Supabase Auth returns that error
--    straight to the signup call -- that's how "username taken" gets enforced.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, handle, name, rating, sales, blurb, location, user_id, username_set)
  values (
    new.id::text,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'username', 'New user'),
    5.0,
    0,
    '',
    '',
    new.id,
    (new.raw_user_meta_data->>'username') is not null
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Write policies. Public read policies for profiles/listings already exist
--    from 001 and are unchanged -- this section only adds INSERT/UPDATE/DELETE.

-- No INSERT policy on profiles at all: the only way a row gets created is the
-- SECURITY DEFINER trigger above, which runs as the table owner and bypasses RLS.
-- This blocks anyone from inserting an arbitrary profile row directly.

create policy "Owner can update own profile"
  on profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- ^ a signed-in user can edit only the profile row whose user_id matches their auth id.

create policy "Owner can insert own listings"
  on listings for insert
  with check (
    exists (select 1 from profiles where profiles.id = listings.seller_id and profiles.user_id = auth.uid())
  );
-- ^ you can only create a listing whose seller_id points to a profile you own.

create policy "Owner can update own listings"
  on listings for update
  using (
    exists (select 1 from profiles where profiles.id = listings.seller_id and profiles.user_id = auth.uid())
  )
  with check (
    exists (select 1 from profiles where profiles.id = listings.seller_id and profiles.user_id = auth.uid())
  );
-- ^ same ownership check, for edits to an existing listing.

create policy "Owner can delete own listings"
  on listings for delete
  using (
    exists (select 1 from profiles where profiles.id = listings.seller_id and profiles.user_id = auth.uid())
  );
-- ^ same ownership check, for deleting a listing.
