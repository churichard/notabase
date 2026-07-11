create or replace function public.validate_note_content_size()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  new_size bigint := octet_length(new.content::text);
  old_size bigint := case
    when tg_op = 'UPDATE' then octet_length(old.content::text)
    else 0
  end;
begin
  if new.content::text ~* '"data:image/[a-z0-9.+-]+;base64,' then
    raise exception using
      errcode = 'P0001',
      message = 'NOTE_CONTAINS_INLINE_IMAGE';
  end if;

  if new_size > 5 * 1024 * 1024
    and (tg_op = 'INSERT' or old_size <= 5 * 1024 * 1024 or new_size > old_size)
  then
    raise exception using
      errcode = 'P0001',
      message = 'NOTE_CONTENT_TOO_LARGE';
  end if;

  return new;
end;
$$;
