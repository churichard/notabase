# Notabase

[![Twitter](https://img.shields.io/twitter/follow/notabase?style=social)](https://twitter.com/notabase)
[![Discord](https://img.shields.io/discord/852987194619985990?label=discord&logo=discord)](https://discord.gg/BQKNRu7nv5)

[Notabase](https://notabase.io) is a personal knowledge base for networked thinking.

It lets you connect knowledge and form ideas by linking notes together. These links allow you to traverse your notes like webpages and find connections that you never would have thought of otherwise. Think of it as a personal Wikipedia for your brain that you can edit and browse as you like. As you add more notes, it gets more powerful!

It is inspired by note-taking apps such as Notion, Obsidian, Typora, and Roam Research.

![demo](https://user-images.githubusercontent.com/4218237/135161184-88b3afa8-3f64-46c2-82e8-d0a22d285642.gif)

## Features

- 📖 Browse your notes with **page stacking** (similar to [Andy's working notes](https://notes.andymatuschak.org/About_these_notes))
- 📝 **WYSIWYG editor** with markdown support makes it easy to read and edit notes
- 🔗 **Linked/unlinked references** let you see other notes that reference a specific note
- #️⃣ **Organize your notes** with links, tags, and nested notes
- 📱 Can be installed as a **Progressive Web App (PWA)** for faster loading and offline viewing
- ☁ Your notes are **synced to the cloud** and can be **accessed on any device**
- 🔀 Use the **graph view** to analyze your knowledge graph
- 🔍 **Full-text search** lets you easily find relevant notes
- 🧱 Use **block references** to embed a block of text from another note, which auto-updates when the original block changes
- 🤝 **Import** or **export** your notes at any time
- 🙌 **Open source** with community involvement and transparent development
- 🚀 And much more!

## Status

Notabase is in beta and is under active development.

## Documentation & Support

If you need help getting started with Notabase, check out our [Help Center](https://notabase.io/publish/ed280468-4096-4b21-8298-4a97c4eb990e/note/59df6332-0356-4c06-83ba-a90682ab18fc/).

## Sponsors

Special thanks to the following people for their support:

- [@Jaydon-chai](https://github.com/Jaydon-chai)

Sponsors make it possible for me to continue developing Notabase. Your support is greatly appreciated!

[Become a sponsor](https://github.com/sponsors/churichard)

## Self-hosting / running locally

Notabase is currently focused on the hosted experience, but it is possible for you to self-host it as well. Here are some steps that you need to take to get it running locally:

1. Notabase uses Supabase as the backend (for authentication, database, and storage), so you'll have to make a [Supabase](https://supabase.io) account. If you prefer to self-host Supabase, you can follow the instructions in their [docs](https://supabase.io/docs/guides/self-hosting).
2. Copy `.env.local.example` into `.env.local` and fill in the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`, and `SUPABASE_SERVICE_KEY` variables from your [Supabase dashboard](https://app.supabase.io). The other environment variables are optional.
3. Create your database tables. Apply [full schema](https://github.com/churichard/notabase/blob/main/scripts/schema.sql) and [storage setup](https://github.com/churichard/notabase/blob/main/scripts/storage-setup.sql).
4. In your local environment, install the packages using `npm install`, and then build and run the project using `npm run build` and `npm start -- --port 3000`. You will be able to see Notabase running on http://localhost:3000. Alternatively, for a development environment, run `npm run dev`.

> [!IMPORTANT]
> The hosted and self-hosted versions of Notabase share the same codebase, so by default, there is a cap on the number of notes you can create. You can circumvent this by inserting a new row in the `subscriptions` table for your user id, with `pro` in the `plan_id` column and `active` in the `subscription_status` column.

## Testing

### Unit tests

You can run unit tests by running `npm run test`.

### Cypress tests

First-time setup:

1. Install Docker and Docker Compose.
2. Run `npx supabase init` to initialize your Supabase project.
3. Copy `.env.test.example` into `.env.test` and fill in the environment variables.

To run tests:

1. Start Docker.
2. Run `npx supabase start`.
3. Run `NODE_ENV=test npm run dev`.
4. Run `npm run cy:open` to run Cypress tests in a GUI, or `npm run cy:run` to run them in the CLI.

## License

Notabase is licensed under the AGPL license, and is free for personal use.

If you'd like to use Notabase for commercial use, please contact me for a commercial license.
