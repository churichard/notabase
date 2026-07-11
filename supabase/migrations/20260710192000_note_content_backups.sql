create table if not exists public.note_content_backups (
  note_id uuid primary key references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null,
  backed_up_at timestamptz not null default now()
);

alter table public.note_content_backups enable row level security;

-- Backups are intentionally accessible only with the service role.
revoke all on public.note_content_backups from anon, authenticated;

create or replace function public.notes_with_inline_images()
returns table(note_id uuid)
language sql
security definer
set search_path = public
as $$
  select id
  from public.notes
  where content::text ~* 'data:image/[a-z0-9.+-]+;base64,';
$$;

revoke all on function public.notes_with_inline_images() from public, anon, authenticated;
grant execute on function public.notes_with_inline_images() to service_role;
