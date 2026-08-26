create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  topic text not null check (topic in ('School', 'Family', 'Friendship', 'Identity', 'Starting over', 'Setbacks', 'Uncertainty', 'Rebuilding')),
  title text not null check (char_length(title) between 8 and 90),
  happened text not null check (char_length(happened) between 40 and 1800),
  helped text check (helped is null or char_length(helped) <= 900),
  wish_known text check (wish_known is null or char_length(wish_known) <= 900),
  author_alias text not null check (author_alias ~ '^Anonymous [A-Za-z]+$'),
  session_hash text not null,
  recovery_hash text not null unique,
  status text not null default 'review' check (status in ('published', 'review', 'deleted')),
  moderation_notes text[] not null default '{}',
  content_note text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  search_document tsvector generated always as (
    to_tsvector(
      'english'::regconfig,
      coalesce(title, '') || ' ' ||
      coalesce(topic, '') || ' ' ||
      coalesce(happened, '') || ' ' ||
      coalesce(helped, '') || ' ' ||
      coalesce(wish_known, '')
    )
  ) stored
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_alias text not null check (author_alias ~ '^Anonymous [A-Za-z]+$'),
  body text not null check (char_length(body) between 2 and 280),
  session_hash text not null,
  status text not null default 'review' check (status in ('published', 'review')),
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  session_hash text not null,
  reaction_type text not null check (reaction_type in ('seen', 'helped', 'with_you')),
  created_at timestamptz not null default now(),
  primary key (post_id, session_hash)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  session_hash text not null,
  reason text not null check (reason in ('private_information', 'unsafe_advice', 'harassment', 'spam', 'other')),
  details text not null default '' check (char_length(details) <= 240),
  created_at timestamptz not null default now(),
  unique (post_id, session_hash)
);

create table if not exists public.rate_limit_events (
  id bigint generated always as identity primary key,
  session_hash text not null,
  action text not null check (action in ('post', 'reply', 'reaction', 'report', 'manage')),
  created_at timestamptz not null default now()
);

create index if not exists posts_status_created_idx on public.posts (status, created_at desc);
create index if not exists posts_topic_status_idx on public.posts (topic, status);
create index if not exists posts_search_idx on public.posts using gin (search_document);
create index if not exists replies_post_status_idx on public.replies (post_id, status, created_at);
create index if not exists reactions_post_idx on public.reactions (post_id);
create index if not exists reports_post_idx on public.reports (post_id);
create index if not exists rate_limit_lookup_idx on public.rate_limit_events (session_hash, action, created_at desc);

alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;
alter table public.rate_limit_events enable row level security;

revoke all on public.posts from anon, authenticated;
revoke all on public.replies from anon, authenticated;
revoke all on public.reactions from anon, authenticated;
revoke all on public.reports from anon, authenticated;
revoke all on public.rate_limit_events from anon, authenticated;

create or replace function public.consume_rate_limit(
  p_session_hash text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  delete from public.rate_limit_events
  where created_at < now() - interval '24 hours';

  select count(*) into recent_count
  from public.rate_limit_events
  where session_hash = p_session_hash
    and action = p_action
    and created_at > now() - make_interval(secs => p_window_seconds);

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.rate_limit_events (session_hash, action)
  values (p_session_hash, p_action);
  return true;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

