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

If you need help getting started with Notabase, check out our [Help Center](https://help.notabase.io).

## Self-hosting / running locally

Notabase is currently focused on the hosted experience, but it is possible for you to self-host it as well. Here are some steps that you need to take to get it running locally:

1. Notabase uses Supabase as the backend (for authentication, database, and storage), so you'll have to make a [Supabase](https://supabase.io) account. If you prefer to self-host Supabase, you can follow the instructions in their [docs](https://supabase.io/docs/guides/self-hosting).
2. Copy `.env.local.example` into `.env.local` and fill in the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`, and `SUPABASE_SERVICE_KEY` variables from your [Supabase dashboard](https://app.supabase.io). The other environment variables are optional.
3. Go to the Table Editor in the Supabase dashboard and create two new tables: `users` and `notes`.
   | users | |
   | ----------- | ----------- |
   | id | uuid |

   | notes      |             |
   | ---------- | ----------- |
   | id         | uuid        |
   | user_id    | uuid        |
   | title      | text        |
   | content    | jsonb       |
   | created_at | timestamptz |
   | updated_at | timestamptz |

4. In your local development environment, install the packages using `npm install`, and then run the project using `npm run dev`.

## Sponsors

Sponsors make it possible for me to continue developing Notabase. Your support is greatly appreciated!

[Become a sponsor](https://github.com/sponsors/churichard)

## License

Notabase is licensed under the AGPL license, and is free for personal use.

If you'd like to use Notabase for commercial use, please contact me for a commercial license.
