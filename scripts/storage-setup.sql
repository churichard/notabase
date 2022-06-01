-- Create storage bucket

insert into storage.buckets (id, name)
values ('user-assets', 'user-assets');


-- Add row-level-security policy for storage

create policy "Access to user's file uploads"
on storage.objects for all
using ((bucket_id='user-assets'::text) AND ((auth.uid())::text=(storage.foldername(name))[1]))
with check ((bucket_id='user-assets'::text) AND ((auth.uid())::text=(storage.foldername(name))[1]));

