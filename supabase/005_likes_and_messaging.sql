-- AutoBridge: likes + buyer/seller messaging
-- Run this once in the Supabase SQL Editor, after 004 has already been run.
-- Safe to re-run from scratch: every step below is idempotent.

-- 1. Likes: one row per (user, listing). Toggling a like is just an insert/
--    delete of this row -- no boolean column to keep in sync.
create table if not exists likes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id int not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists likes_listing_idx on likes (listing_id);

alter table likes enable row level security;

drop policy if exists "Public read likes" on likes;
create policy "Public read likes" on likes
  for select using (true);
-- ^ like state isn't sensitive and is needed to compute counts/heart-fill
--   across any viewer -- same public-read posture as listings.

drop policy if exists "User can like a listing" on likes;
create policy "User can like a listing" on likes
  for insert with check (auth.uid() = user_id);
-- ^ you can only create a like row for yourself.

drop policy if exists "User can unlike a listing" on likes;
create policy "User can unlike a listing" on likes
  for delete using (auth.uid() = user_id);
-- ^ same ownership check, for removing your own like.

-- 2. Threads: one conversation per (listing, buyer). Re-messaging the same
--    seller about the same listing reuses the existing thread rather than
--    forking a new one.
create table if not exists threads (
  id bigint generated always as identity primary key,
  listing_id int not null references listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint threads_buyer_seller_distinct check (buyer_id <> seller_id)
);

create unique index if not exists threads_listing_buyer_unique on threads (listing_id, buyer_id);
create index if not exists threads_buyer_idx on threads (buyer_id);
create index if not exists threads_seller_idx on threads (seller_id);

alter table threads enable row level security;

drop policy if exists "Participant can read own threads" on threads;
create policy "Participant can read own threads" on threads
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
-- ^ only the two people in the conversation can see it exists at all.

drop policy if exists "Buyer can start a thread" on threads;
create policy "Buyer can start a thread" on threads
  for insert with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from listings
      join profiles on profiles.id = listings.seller_id
      where listings.id = threads.listing_id and profiles.user_id = threads.seller_id
    )
  );
-- ^ you can only create a thread as yourself (the buyer), and seller_id must
--   actually be the real seller of that listing -- prevents spoofing a
--   conversation with someone who isn't the listing's owner.
-- No update/delete policy: threads are immutable once created.

-- 3. Messages: individual chat messages within a thread.
create table if not exists messages (
  id bigint generated always as identity primary key,
  thread_id bigint not null references threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists messages_thread_created_idx on messages (thread_id, created_at);

alter table messages enable row level security;

drop policy if exists "Participant can read thread messages" on messages;
create policy "Participant can read thread messages" on messages
  for select using (
    exists (
      select 1 from threads
      where threads.id = messages.thread_id
        and (threads.buyer_id = auth.uid() or threads.seller_id = auth.uid())
    )
  );

drop policy if exists "Participant can send thread messages" on messages;
create policy "Participant can send thread messages" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from threads
      where threads.id = messages.thread_id
        and (threads.buyer_id = auth.uid() or threads.seller_id = auth.uid())
    )
  );
-- ^ you can only post as yourself, into a thread you're actually part of.

drop policy if exists "Recipient can mark messages read" on messages;
create policy "Recipient can mark messages read" on messages
  for update using (
    sender_id <> auth.uid()
    and exists (
      select 1 from threads
      where threads.id = messages.thread_id
        and (threads.buyer_id = auth.uid() or threads.seller_id = auth.uid())
    )
  )
  with check (
    sender_id <> auth.uid()
    and exists (
      select 1 from threads
      where threads.id = messages.thread_id
        and (threads.buyer_id = auth.uid() or threads.seller_id = auth.uid())
    )
  );
-- ^ only the recipient (not the sender) can flip read_at on a message, and
--   only within a thread they participate in. No delete policy -- messages
--   are permanent.

-- 4. Realtime: messages must stream to open conversations without a
--    refresh. Supabase Realtime enforces each subscriber's RLS on
--    postgres_changes, so the participant-only select policy above is what
--    keeps this scoped to the two people in the thread rather than
--    broadcasting every message in the table to every connected client.
--    ALTER PUBLICATION ... ADD TABLE has no IF NOT EXISTS clause, so this
--    checks pg_publication_tables first to stay safe to re-run.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
end $$;

-- 5. Thread previews: the Inbox list needs, per thread, the listing title,
--    the other participant's handle, the last message, and an unread count
--    -- all as of "right now" for the querying user. A security_invoker view
--    runs under the calling role, so it inherits the RLS above (threads,
--    messages, profiles) instead of the view owner's -- it does not need
--    its own policies.
drop view if exists thread_previews;
create view thread_previews with (security_invoker = true) as
select
  t.id as thread_id,
  t.listing_id,
  t.buyer_id,
  t.seller_id,
  l.title as listing_title,
  l.cat as listing_cat,
  l.tint as listing_tint,
  l.photos as listing_photos,
  bp.handle as buyer_handle,
  sp.handle as seller_handle,
  lm.body as last_message_body,
  lm.created_at as last_message_at,
  lm.sender_id as last_message_sender_id,
  coalesce(uc.unread_count, 0) as unread_count
from threads t
join listings l on l.id = t.listing_id
join profiles bp on bp.user_id = t.buyer_id
join profiles sp on sp.user_id = t.seller_id
left join lateral (
  select m.body, m.created_at, m.sender_id
  from messages m
  where m.thread_id = t.id
  order by m.created_at desc
  limit 1
) lm on true
left join lateral (
  select count(*)::int as unread_count
  from messages m2
  where m2.thread_id = t.id
    and m2.sender_id <> auth.uid()
    and m2.read_at is null
) uc on true;
