do $$
begin
  if exists (
    select 1
    from public.notes
    where content::text ~* '"data:image/[a-z0-9.+-]+;base64,'
  ) then
    raise exception 'Existing notes still contain inline images';
  end if;
end;
$$;

drop trigger if exists validate_note_content on public.notes;
create trigger validate_note_content
  before insert or update of content on public.notes
  for each row execute function public.validate_note_content_size();
