create or replace function public.compact_jsonb_size(value jsonb)
returns bigint
language plpgsql
immutable
set search_path = public
as $$
declare
  result bigint;
  item_count bigint;
begin
  if jsonb_typeof(value) = 'array' then
    select coalesce(sum(public.compact_jsonb_size(item)), 0), count(*)
      into result, item_count
      from jsonb_array_elements(value) item;
    return 2 + result + greatest(item_count - 1, 0);
  end if;

  if jsonb_typeof(value) = 'object' then
    select coalesce(
      sum(
        octet_length(to_jsonb(key)::text)
        + 1
        + public.compact_jsonb_size(item)
      ),
      0
    ), count(*)
      into result, item_count
      from jsonb_each(value) as fields(key, item);
    return 2 + result + greatest(item_count - 1, 0);
  end if;

  return octet_length(value::text);
end;
$$;

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

  if new.content::text ~* 'data:image/[a-z0-9.+-]+;base64,' then
    raise exception using
      errcode = 'P0001',
      message = 'NOTE_CONTAINS_INLINE_IMAGE';
  end if;

  return new;
end;
$$;

-- Enable this trigger only after the existing inline images have been migrated.
