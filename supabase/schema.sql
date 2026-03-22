-- =============================================
-- PUMIAH SOCIAL - Supabase Database Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- =============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null,
  bio text default '',
  profile_photo_url text default '',
  cover_photo_url text default '',
  location text default '',
  date_of_birth date,
  created_at timestamptz default now() not null
);

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Profiles: select for authenticated" on public.profiles
  for select to authenticated using (true);

create policy "Profiles: insert own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "Profiles: update own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- =============================================
-- 2. FRIEND REQUESTS TABLE
-- =============================================
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now() not null,
  constraint unique_request unique (sender_id, receiver_id),
  constraint no_self_request check (sender_id != receiver_id)
);

-- RLS for friend_requests
alter table public.friend_requests enable row level security;

create policy "Friend requests: select own" on public.friend_requests
  for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Friend requests: insert as sender" on public.friend_requests
  for insert to authenticated with check (auth.uid() = sender_id);

create policy "Friend requests: update as receiver" on public.friend_requests
  for update to authenticated using (auth.uid() = receiver_id);

create policy "Friend requests: update as sender" on public.friend_requests
  for update to authenticated using (auth.uid() = sender_id);

create policy "Friend requests: delete as sender" on public.friend_requests
  for delete to authenticated using (auth.uid() = sender_id);

-- RPC: Atomically send a friend request (cleans up stale records)
create or replace function public.send_friend_request(target_user_id uuid)
returns json as $$
declare
  result json;
  current_user_id uuid := auth.uid();
begin
  delete from public.friend_requests
  where (sender_id = current_user_id and receiver_id = target_user_id)
     or (sender_id = target_user_id and receiver_id = current_user_id);

  delete from public.friendships
  where (user1_id = least(current_user_id, target_user_id) and user2_id = greatest(current_user_id, target_user_id));

  insert into public.friend_requests (sender_id, receiver_id, status)
  values (current_user_id, target_user_id, 'pending');

  select row_to_json(fr) into result
  from public.friend_requests fr
  where fr.sender_id = current_user_id and fr.receiver_id = target_user_id;

  return result;
end;
$$ language plpgsql security definer;

-- =============================================
-- 3. FRIENDSHIPS TABLE
-- =============================================
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references public.profiles(id) on delete cascade,
  user2_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  constraint unique_friendship unique (user1_id, user2_id),
  constraint ordered_ids check (user1_id < user2_id)
);

-- RLS for friendships
alter table public.friendships enable row level security;

create policy "Friendships: select own" on public.friendships
  for select to authenticated using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Friendships: insert authenticated" on public.friendships
  for insert to authenticated with check (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Friendships: delete own" on public.friendships
  for delete to authenticated using (auth.uid() = user1_id or auth.uid() = user2_id);

-- =============================================
-- 4. POSTS TABLE
-- =============================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_type text not null default 'text' check (post_type in ('text', 'image', 'link')),
  content text default '',
  media_url text,
  link_url text,
  created_at timestamptz default now() not null
);

-- RLS for posts
alter table public.posts enable row level security;

create policy "Posts: select for authenticated" on public.posts
  for select to authenticated using (true);

create policy "Posts: insert own" on public.posts
  for insert to authenticated with check (auth.uid() = profile_id);

create policy "Posts: update own" on public.posts
  for update to authenticated using (auth.uid() = profile_id);

create policy "Posts: delete own" on public.posts
  for delete to authenticated using (auth.uid() = profile_id);

-- =============================================
-- 5. COMMENTS TABLE
-- =============================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null
);

-- RLS for comments
alter table public.comments enable row level security;

create policy "Comments: select for authenticated" on public.comments
  for select to authenticated using (true);

create policy "Comments: insert own" on public.comments
  for insert to authenticated with check (auth.uid() = profile_id);

create policy "Comments: delete own" on public.comments
  for delete to authenticated using (auth.uid() = profile_id);

-- =============================================
-- 6. LIKES TABLE
-- =============================================
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null,
  target_type text not null check (target_type in ('post', 'comment')),
  created_at timestamptz default now() not null,
  constraint unique_like unique (profile_id, target_id, target_type)
);

-- RLS for likes
alter table public.likes enable row level security;

create policy "Likes: select for authenticated" on public.likes
  for select to authenticated using (true);

create policy "Likes: insert own" on public.likes
  for insert to authenticated with check (auth.uid() = profile_id);

create policy "Likes: delete own" on public.likes
  for delete to authenticated using (auth.uid() = profile_id);

-- =============================================
-- 7. NOTIFICATIONS TABLE
-- =============================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('like_post', 'like_comment', 'comment_post', 'friend_request_received', 'friend_request_accepted')),
  message text not null,
  target_url text,
  is_read boolean default false not null,
  created_at timestamptz default now() not null
);

-- RLS for notifications
alter table public.notifications enable row level security;

create policy "Notifications: select own" on public.notifications
  for select to authenticated using (auth.uid() = recipient_id);

create policy "Notifications: insert authenticated" on public.notifications
  for insert to authenticated with check (true);

create policy "Notifications: update own read" on public.notifications
  for update to authenticated using (auth.uid() = recipient_id);

-- =============================================
-- 8. CONVERSATIONS TABLE (Pumiah Messenger)
-- =============================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references public.profiles(id) on delete cascade,
  user2_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  constraint unique_conversation unique (user1_id, user2_id),
  constraint ordered_conversation_ids check (user1_id < user2_id)
);

-- RLS for conversations
alter table public.conversations enable row level security;

create policy "Conversations: select own" on public.conversations
  for select to authenticated using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Conversations: insert own" on public.conversations
  for insert to authenticated with check (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Conversations: update own" on public.conversations
  for update to authenticated using (auth.uid() = user1_id or auth.uid() = user2_id);

-- =============================================
-- 9. MESSAGES TABLE (Pumiah Messenger)
-- =============================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false not null,
  created_at timestamptz default now() not null
);

-- RLS for messages
alter table public.messages enable row level security;

create policy "Messages: select own conversations" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
    )
  );

create policy "Messages: insert own" on public.messages
  for insert to authenticated with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
    )
  );

create policy "Messages: update read status" on public.messages
  for update to authenticated using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
    )
  );

-- =============================================
-- 10. INDEXES
-- =============================================
create index if not exists idx_posts_profile_id on public.posts(profile_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_likes_target on public.likes(target_id, target_type);
create index if not exists idx_notifications_recipient on public.notifications(recipient_id, is_read);
create index if not exists idx_friend_requests_receiver on public.friend_requests(receiver_id, status);
create index if not exists idx_friendships_user1 on public.friendships(user1_id);
create index if not exists idx_friendships_user2 on public.friendships(user2_id);
create index if not exists idx_conversations_user1 on public.conversations(user1_id);
create index if not exists idx_conversations_user2 on public.conversations(user2_id);
create index if not exists idx_conversations_last_msg on public.conversations(last_message_at desc);
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_unread on public.messages(conversation_id, is_read) where not is_read;

-- =============================================
-- 11. DATABASE FUNCTIONS & TRIGGERS
-- =============================================

-- Function: Create notification on post like
create or replace function public.handle_post_like()
returns trigger as $$
declare
  post_owner uuid;
  sender_name text;
begin
  select profile_id into post_owner from public.posts where id = NEW.target_id;
  select full_name into sender_name from public.profiles where id = NEW.profile_id;

  if post_owner is not null and post_owner != NEW.profile_id and NEW.target_type = 'post' then
    insert into public.notifications (recipient_id, sender_id, type, message, target_url)
    values (post_owner, NEW.profile_id, 'like_post', sender_name || ' liked your post', '/feed');
  end if;

  -- Handle comment likes
  if NEW.target_type = 'comment' then
    declare
      comment_owner uuid;
    begin
      select profile_id into comment_owner from public.comments where id = NEW.target_id;
      if comment_owner is not null and comment_owner != NEW.profile_id then
        insert into public.notifications (recipient_id, sender_id, type, message, target_url)
        values (comment_owner, NEW.profile_id, 'like_comment', sender_name || ' liked your comment', '/feed');
      end if;
    end;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create or replace trigger on_like_created
  after insert on public.likes
  for each row execute function public.handle_post_like();

-- Function: Create notification on comment
create or replace function public.handle_comment()
returns trigger as $$
declare
  post_owner uuid;
  sender_name text;
begin
  select profile_id into post_owner from public.posts where id = NEW.post_id;
  select full_name into sender_name from public.profiles where id = NEW.profile_id;

  if post_owner is not null and post_owner != NEW.profile_id then
    insert into public.notifications (recipient_id, sender_id, type, message, target_url)
    values (post_owner, NEW.profile_id, 'comment_post', sender_name || ' commented on your post', '/feed');
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create or replace trigger on_comment_created
  after insert on public.comments
  for each row execute function public.handle_comment();

-- Function: Create notification on friend request
create or replace function public.handle_friend_request()
returns trigger as $$
declare
  sender_name text;
begin
  if NEW.status = 'pending' then
    select full_name into sender_name from public.profiles where id = NEW.sender_id;
    insert into public.notifications (recipient_id, sender_id, type, message, target_url)
    values (NEW.receiver_id, NEW.sender_id, 'friend_request_received', sender_name || ' sent you a friend request', '/friends');
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create or replace trigger on_friend_request_created
  after insert on public.friend_requests
  for each row execute function public.handle_friend_request();

-- Function: Notify on friend request accepted
create or replace function public.handle_friend_request_accepted()
returns trigger as $$
declare
  accepter_name text;
begin
  if NEW.status = 'accepted' and OLD.status = 'pending' then
    select full_name into accepter_name from public.profiles where id = NEW.receiver_id;
    insert into public.notifications (recipient_id, sender_id, type, message, target_url)
    values (NEW.sender_id, NEW.receiver_id, 'friend_request_accepted', accepter_name || ' accepted your friend request', '/friends');
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create or replace trigger on_friend_request_updated
  after update on public.friend_requests
  for each row execute function public.handle_friend_request_accepted();

-- =============================================
-- 12. STORAGE BUCKETS
-- =============================================
-- Run these in the Supabase Dashboard > Storage or via API:
-- insert into storage.buckets (id, name, public) values ('profile_photos', 'profile_photos', true);
-- insert into storage.buckets (id, name, public) values ('post_images', 'post_images', true);

-- Storage policies (run in SQL editor):
-- create policy "Public read profile photos" on storage.objects for select using (bucket_id = 'profile_photos');
-- create policy "Authenticated upload profile photos" on storage.objects for insert to authenticated with check (bucket_id = 'profile_photos');
-- create policy "Owners update profile photos" on storage.objects for update to authenticated using (bucket_id = 'profile_photos');
-- create policy "Public read post images" on storage.objects for select using (bucket_id = 'post_images');
-- create policy "Authenticated upload post images" on storage.objects for insert to authenticated with check (bucket_id = 'post_images');

-- =============================================
-- 13. ENABLE REALTIME
-- =============================================
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
