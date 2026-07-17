drop trigger if exists refresh_note_backlink_index on public.notes;
drop function if exists public.refresh_note_backlink_index();
drop function if exists public.backlink_safe_json(jsonb);
drop table if exists public.note_backlink_index;

create view public.note_backlink_index
with (security_invoker = true, security_barrier = true)
as
select
  id as note_id,
  user_id,
  title,
  content,
  updated_at
from public.notes
where user_id = (select auth.uid());

grant select on public.note_backlink_index to authenticated;
