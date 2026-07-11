create or replace function public.validate_note_content_size()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.compact_jsonb_size(new.content) > 5 * 1024 * 1024 then
    raise exception using
      errcode = 'P0001',
      message = 'NOTE_CONTENT_TOO_LARGE';
  end if;

  if new.content::text ~* '"data:image/[a-z0-9.+-]+;base64,' then
    raise exception using
      errcode = 'P0001',
      message = 'NOTE_CONTAINS_INLINE_IMAGE';
  end if;

  return new;
end;
$$;

create or replace function public.notes_with_inline_images()
returns table(note_id uuid)
language sql
security definer
set search_path = public
as $$
  select id
  from public.notes
  where content::text ~* '"data:image/[a-z0-9.+-]+;base64,';
$$;

revoke all on function public.notes_with_inline_images() from public, anon, authenticated;
grant execute on function public.notes_with_inline_images() to service_role;
