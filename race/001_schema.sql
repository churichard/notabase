-- Minimal DDL mirroring the tables the webhook writes to (with this change applied).
CREATE TABLE subscriptions(id serial PRIMARY KEY,stripe_subscription_id text UNIQUE,subscription_status text NOT NULL,stripe_event_created bigint);
CREATE FUNCTION skip_stale_stripe_subscription_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF OLD.stripe_event_created IS NOT NULL AND NEW.stripe_event_created IS NOT NULL AND NEW.stripe_event_created < OLD.stripe_event_created THEN RETURN NULL; END IF; RETURN NEW; END $$;
CREATE TRIGGER skip_stale_stripe_subscription_event BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION skip_stale_stripe_subscription_event();
