create or replace function public.validate_note_content_size()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if octet_length(new.content::text) > 5 * 1024 * 1024 then
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
