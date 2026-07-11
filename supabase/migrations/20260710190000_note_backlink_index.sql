create extension if not exists citext with schema public;

create table if not exists public.note_backlink_index (
  note_id uuid primary key references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title public.citext not null,
  content jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.note_backlink_index enable row level security;

create policy "Users can read their own backlink index"
  on public.note_backlink_index for select
  using (auth.uid() = user_id);

create or replace function public.backlink_safe_json(value jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select regexp_replace(
    value::text,
    '"data:image/[a-z0-9.+-]+;base64,[^\"]*"',
    '""',
    'gi'
  )::jsonb;
$$;

create or replace function public.refresh_note_backlink_index()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.note_backlink_index (note_id, user_id, title, content, updated_at)
  values (
    new.id,
    new.user_id,
    new.title,
    public.backlink_safe_json(new.content),
    new.updated_at
  )
  on conflict (note_id) do update set
    user_id = excluded.user_id,
    title = excluded.title,
    content = excluded.content,
    updated_at = excluded.updated_at;
  return new;
end;
$$;

drop trigger if exists refresh_note_backlink_index on public.notes;
create trigger refresh_note_backlink_index
  after insert or update of title, content on public.notes
  for each row execute function public.refresh_note_backlink_index();

insert into public.note_backlink_index (note_id, user_id, title, content, updated_at)
select id, user_id, title, public.backlink_safe_json(content), updated_at
from public.notes
on conflict (note_id) do update set
  user_id = excluded.user_id,
  title = excluded.title,
  content = excluded.content,
  updated_at = excluded.updated_at;

create index if not exists note_backlink_index_user_id_idx
  on public.note_backlink_index(user_id);

grant select on public.note_backlink_index to authenticated;
