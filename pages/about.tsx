import Head from 'next/head';
import LandingLayout from 'components/landing/LandingLayout';

export default function About() {
  return (
    <LandingLayout>
      <Head>
        <title>About | Notabase</title>
      </Head>
      <div className="prose-primary container prose px-6 py-16 lg:prose-xl">
        <h1>About Notabase</h1>
        <div>
          <p>
            Notabase (pronounced <i>noh-tuh-base</i>) is a personal knowledge
            base for networked thinking.
          </p>
          <p>
            I started Notabase because I couldn&apos;t find a note-taking app
            that meshed with the way I think. The existing options were too
            complicated and hard to use, or didn&apos;t have the capabilities I
            needed.
          </p>
          <p>
            The ideal note-taking app doesn&apos;t just let you take notes; it
            helps you <b>write and think better</b>. With that fundamental
            guiding star, I eventually settled on three core principles:
          </p>
          <ol className="font-semibold">
            <li>Easy to use; it just works.</li>
            <li>Links are first-class citizens.</li>
            <li>Open, transparent, and privacy-friendly.</li>
          </ol>
        </div>
        <div>
          <h2>1. Easy to use; it just works</h2>
          <p>
            Some note-taking apps have such a big learning curve that they feel
            more like coding than writing. In contrast, Notabase is honed to be
            as easy-to-use as possible, but without sacrificing power.
          </p>
          <p>
            Notabase has a WYSIWYG editor that gives you a rich-text experience,
            regardless of whether you&apos;re reading or editing a note. You can
            format text using keyboard shortcuts, a formatting toolbar, or
            Markdown.
          </p>
          <p>
            It&apos;s built for the universal platform: the web. Your notes are
            automatically accessible across all of your devices&mdash;no
            additional setup needed.
          </p>
        </div>
        <div>
          <h2>2. Links are first-class citizens</h2>
          <p>
            Nothing exists in a vacuum, so your notes shouldn&apos;t either.
            With Notabase, your notes form bidirectional links to each other,
            allowing you to organize knowledge associatively, not just
            hierarchically.
          </p>
          <p>
            The real power comes from backlinks, which let you see which notes
            link to a specific note. This allows relevant notes and pieces of
            knowledge to naturally bubble up to the surface, empowering your
            writing, research, and ideas.
          </p>
          <p>
            With these links, your notes form a network&mdash;your own, personal
            knowledge graph&mdash;so every note, idea, and piece of knowledge
            you have is <i>mise en place</i>.
          </p>
        </div>
        <div>
          <h2>3. Open, transparent, and privacy-friendly</h2>
          <p>
            Notabase is{' '}
            <a
              href="https://github.com/churichard/notabase"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              open source
            </a>
            , which means that development happens transparently.
          </p>
          <p>
            Notabase will never sell your data or advertise to you. The only way
            Notabase makes money is from users paying for the product, which
            aligns incentives.
          </p>
          <p>
            There&apos;s also no lock-in; your notes are fully owned by you. You
            can export your notes at any time to Markdown. And since Notabase is
            open source, you can even self-host it.
          </p>
        </div>
      </div>
    </LandingLayout>
  );
}
