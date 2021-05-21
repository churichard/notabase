# Notabase

[Notabase](https://notabase.io) is a personal knowledge base for non-linear thinking.

It lets you connect knowledge and form ideas by linking notes together. These links allow you to traverse your notes like webpages and find connections that you never would have thought of otherwise. Think of it as a personal Wikipedia for your brain that you can edit and browse as you like. As you add more notes, it gets more powerful!

It is inspired by note-taking apps such as Notion, Obsidian, Typora, and Roam Research.

https://user-images.githubusercontent.com/4218237/118325487-62d46180-b4b8-11eb-950a-5cdabdd52821.mp4

## Status

Notabase is currently in alpha.

## Features

- Seamlessly navigate and browse through your notes side-by-side
- WYSIWYG editor with markdown support makes it easy to edit notes
- Linked references let you see other notes that reference a specific note
- Your notes are synced to the cloud and can be accessed on any device
- Use the graph view to analyze your knowledge graph
- Offline support (coming soon)
- Open source, allowing community involvement and transparent development

## Self-hosting

Notabase is currently focused on the hosted experience, but it is possible for you to self-host it as well. Here's a list of steps that you need to take to get it running locally (not tested):

1. Notabase uses Supabase as the backend (for authentication and the database), so you'll have to make a [Supabase](https://supabase.io) account. If you prefer to self-host Supabase as well, you can follow the instructions in their [docs](https://supabase.io/docs/guides/self-hosting).
2. Copy `.env.local.example` into `.env.local` and fill in the environment variables from your [Supabase dashboard](https://app.supabase.io). Go to `Settings` and click on `API`. `NEXT_PUBLIC_SUPABASE_URL` is the `Config URL`, `NEXT_PUBLIC_SUPABASE_KEY` is the public `anon` key, and `SUPABASE_SERVICE_KEY` is the secret `service_role` key.
3. Go to the Table Editor on the Supabase dashboard and create two new tables: `users` and `notes`. `users` requires a `id` column with type `uuid`. `notes` requires a `id` column with type `uuid`, a `user_id` column that is a foreign key for the `users` `id` column, a `title` column with type `text`, and a `content` column with type `jsonb`.
4. You'll want to create a stored procedure that creates a new user in the `users` table whenever a new user is created through Supabase authentication. Go to the SQL tab on the Supabase dashboard and create a new query. Paste the following inside:  

    ```
    create function public.handle_new_user() 
    returns trigger as $$
    begin
      insert into public.users (id)
      values (new.id);
      return new;
    end;
    $$ language plpgsql security definer;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    ```

    Then run the query.
5. In your local development environment, install the packages using `npm install`, and then run the project using `npm run dev`.

If you have any feedback about these instructions or have ways to make it better, please let me know.
