create or replace function public.can_upload_user_asset()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = (select auth.uid())
      and plan_id in ('pro'::public.plan_id, 'catalyst'::public.plan_id)
      and subscription_status = 'active'::public.subscription_status
      and current_period_end > now()
  );
$$;

revoke all on function public.can_upload_user_asset() from public;
grant execute on function public.can_upload_user_asset() to authenticated;

drop policy if exists "Access to user's file uploads" on storage.objects;

create policy "Access to user's file uploads"
on storage.objects for all
using (
  bucket_id = 'user-assets'
  and (auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'user-assets'
  and (auth.uid())::text = (storage.foldername(name))[1]
  and public.can_upload_user_asset()
);
