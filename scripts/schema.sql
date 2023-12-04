-- extensions
CREATE EXTENSION IF NOT EXISTS citext with SCHEMA public;


-- enums

DROP TYPE IF EXISTS plan_id CASCADE;
CREATE TYPE plan_id AS ENUM ('basic', 'pro', 'catalyst');

DROP TYPE IF EXISTS subscription_status CASCADE;
CREATE TYPE subscription_status AS ENUM ('active', 'inactive');

DROP TYPE IF EXISTS billing_frequency CASCADE;
CREATE TYPE billing_frequency AS ENUM ('monthly', 'annual', 'one_time');

DROP TYPE IF EXISTS visibility CASCADE;
CREATE TYPE visibility AS ENUM ('private', 'public');


-- public.notes definition

DROP TABLE IF EXISTS public.notes;
CREATE TABLE public.notes (
  "content" jsonb NOT NULL DEFAULT (('[ { "id": "'::text || extensions.uuid_generate_v4()) || '", "type": "paragraph", "children": [{ "text": "" }] } ]'::text)::jsonb,
  title citext NOT NULL,
  user_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  visibility visibility not null default 'private'::visibility,
  CONSTRAINT non_empty_title CHECK ((title <> ''::citext)),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_user_id_title_key UNIQUE (user_id, title)
);


-- public.subscriptions definition

DROP TABLE IF EXISTS public.subscriptions CASCADE;
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text,
  plan_id plan_id NOT NULL,
  subscription_status subscription_status NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end bool NOT NULL DEFAULT false,
  frequency billing_frequency NOT NULL DEFAULT 'monthly'::billing_frequency,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_stripe_customer_id_key UNIQUE (stripe_customer_id),
  CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id),
  CONSTRAINT subscriptions_user_id_key UNIQUE (user_id)
);


-- public.users definition

DROP TABLE IF EXISTS public.users;
CREATE TABLE public.users (
  id uuid NOT NULL,
  subscription_id uuid NULL,
  note_tree jsonb NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);


-- public.notes foreign keys

ALTER TABLE public.notes ADD CONSTRAINT note_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


-- public.subscriptions foreign keys

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- public.users foreign keys

ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
ALTER TABLE public.users ADD CONSTRAINT users_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


-- set timestamp trigger

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
  RETURNS trigger 
  language plpgsql 
  security definer 
  set search_path = public
  as $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
  $$;

drop trigger if exists set_timestamp on public.notes;
create trigger set_timestamp
  before update on public.notes
  for each row execute function trigger_set_timestamp();


-- handle new user trigger

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger 
  language plpgsql 
  security definer 
  set search_path = public
  as $$
    begin
      insert into public.users (id)
      values (new.id);
      return new;
    end;
  $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- create onboarding notes trigger

CREATE OR REPLACE FUNCTION create_onboarding_notes()
  RETURNS trigger 
  language plpgsql 
  security definer 
  set search_path = public
  as $$
    declare
      getting_started_id uuid := extensions.uuid_generate_v4();
      linked_note_id uuid := extensions.uuid_generate_v4();
      stack_note_id uuid := extensions.uuid_generate_v4();
    begin
      insert into public.notes (id, user_id, title, content)
      values
        (getting_started_id, new.id, 'Getting Started', ('[{"type":"paragraph","children":[{"text":"👋 Welcome to Notabase! Here are some basics to help you get started."}]},{"type":"heading-one","children":[{"text":"Bidirectional linking"}]},{"type":"paragraph","children":[{"text":"Bidirectional linking is a fundamental idea in Notabase. You can link to other notes, and each note displays the notes that link to it (its \"backlinks\"). This lets you navigate through your notes in an associative way and helps you build connections between similar ideas."}]},{"type":"paragraph","children":[{"text":"Link to another note by using the hovering menu, pressing "},{"code":true,"text":"cmd/ctrl"},{"text":" + "},{"code":true,"text":"k"},{"text":", or enclosing its title in double brackets."}]},{"type":"paragraph","children":[{"text":"Try clicking on this link: "},{"type":"note-link","noteId":"' || linked_note_id || '","children":[{"text":"Linked Note"}],"noteTitle":"Linked Note"},{"text":"!"}]},{"type":"heading-one","children":[{"text":"Formatting text"}]},{"type":"paragraph","children":[{"text":"Notabase has a "},{"bold":true,"text":"powerful"},{"text":" editor that displays rich text in real-time. Here are just a few of the ways you can format text:"}]},{"type":"bulleted-list","children":[{"type":"list-item","children":[{"text":"Highlight text and use the hovering menu to "},{"bold":true,"text":"style"},{"text":" "},{"text":"your","italic":true},{"text":" "},{"text":"writing","underline":true}]},{"type":"list-item","children":[{"text":"Type markdown shortcuts, which get converted automatically to rich text as you type"}]},{"type":"list-item","children":[{"text":"Use keyboard shortcuts, like "},{"code":true,"text":"cmd/ctrl"},{"text":" + "},{"code":true,"text":"b"},{"text":" for "},{"bold":true,"text":"bold"},{"text":", "},{"code":true,"text":"cmd/ctrl"},{"text":" + "},{"code":true,"text":"i"},{"text":" for "},{"text":"italics","italic":true},{"text":", etc."}]}]},{"type":"heading-one","children":[{"text":"Creating or finding notes"}]},{"type":"paragraph","children":[{"text":"You can create new notes or find existing notes by clicking on \"Find or create note\" in the sidebar or by pressing "},{"code":true,"text":"cmd/ctrl"},{"text":" + "},{"code":true,"text":"p"},{"text":". Just type in the title of the note you want to create or find."}]}]')::jsonb),
        (linked_note_id, new.id, 'Linked Note', ('[{"type":"paragraph","children":[{"text":"Clicking on a linked note will \""},{"type":"note-link","noteId":"' || stack_note_id || '","children":[{"text":"Page Stacking"}],"noteTitle":"Page Stacking","customText":"stack"},{"text":"\" the note to the side. This lets you easily reference multiple notes at once."}]},{"type":"paragraph","children":[{"text":"You can see what notes link to this note by looking at the \"Linked References\" below."}]}]')::jsonb),
        (stack_note_id, new.id, 'Page Stacking', ('[{"type":"paragraph","children":[{"text":"One of Notabase''s unique features is its ability to \"stack\" notes next to each other. It lets you have read/edit multiple notes at once and reference them all on screen at the same time."}]},{"type":"paragraph","children":[{"text":"Try creating your own notes and linking them together! If you need help, click on \"Notabase\" in the sidebar. From there, you can visit our Help Center or join our Discord."}]}]')::jsonb);
      return new;
    end;
  $$;

drop trigger if exists on_public_user_created on public.users;
create trigger on_public_user_created
  after insert on public.users
  for each row execute function create_onboarding_notes();
