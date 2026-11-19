-- A late customer.subscription.updated must not undo a later customer.subscription.deleted.
-- The Stripe webhook writes event.created into stripe_event_created; an update that carries an
-- older value than the stored one is skipped. Updates that do not set the column are not affected.

alter table public.subscriptions add column if not exists stripe_event_created bigint;

create or replace function public.skip_stale_stripe_subscription_event()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.stripe_event_created is not null
     and new.stripe_event_created is not null
     and new.stripe_event_created < old.stripe_event_created then
    return null;
  end if;
  return new;
end;
$$;

drop trigger if exists skip_stale_stripe_subscription_event on public.subscriptions;
create trigger skip_stale_stripe_subscription_event
  before update on public.subscriptions
  for each row execute function public.skip_stale_stripe_subscription_event();
