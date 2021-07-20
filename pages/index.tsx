import Link from 'next/link';
import Footer from 'components/landing/Footer';
import Navbar from 'components/landing/Navbar';

export default function Home() {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-1">
          <Navbar />
          <div className="py-16 md:py-32">
            <div className="container px-6 text-center">
              <h1 className="text-4xl font-semibold leading-tight md:leading-tight md:text-5xl">
                Networked notes for your research and ideas
              </h1>
              <p className="pt-6 text-2xl text-gray-700 md:pt-8 md:text-3xl">
                Notabase is a personal knowledge base for networked thinking.
              </p>
              <Link href="/signup">
                <a className="inline-block mt-6 font-semibold md:mt-8 btn">
                  Start your knowledge base
                </a>
              </Link>
              <video
                className="mx-auto mt-8 rounded-md md:mt-16 shadow-popover"
                width={1200}
                autoPlay
                loop
                muted
              >
                <source src="/demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="py-16 bg-gray-100 md:py-32">
            <div className="container flex flex-col items-center px-6 md:flex-row md:space-x-12">
              <div className="flex-1">
                <h2 className="text-3xl font-semibold text-center md:text-4xl">
                  Write the way you think
                </h2>
                <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                  <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    With Notabase, your notes link to each other.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    These links form a network: your own, personal knowledge
                    graph. The more you write, the more powerful it gets.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    When you look at a note, relevant notes will surface
                    naturally&mdash;empowering your writing, research, and
                    ideas.
                  </p>
                </div>
              </div>
              <div className="flex-1 mt-12 md:mt-0">
                <video
                  className="mx-auto rounded-md shadow-popover"
                  width={400}
                  autoPlay
                  loop
                  muted
                >
                  <source src="/graph.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          <div className="py-16 md:py-32">
            <div className="container flex flex-col items-center px-6 md:flex-row md:space-x-12">
              <div className="flex-1 order-1 mt-12 md:order-none md:mt-0">
                <video
                  className="mx-auto rounded-md shadow-popover"
                  width={400}
                  autoPlay
                  loop
                  muted
                >
                  <source src="/rich_text.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-semibold text-center md:text-4xl">
                  Easy to use; it just works
                </h2>
                <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                  <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    As you{' '}
                    <code className="p-0.25 bg-gray-200 rounded text-primary-800">
                      type
                    </code>
                    , everything is converted <i>effortlessly</i> into{' '}
                    <b>rich-text</b>. This makes it frictionless to write down
                    and read your thoughts.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    Your notes are automatically synced across all of your
                    devices, so they&apos;re accessible from anywhere.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    No fiddling, no hassle&mdash;everything works out of the box
                    with no setup.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="py-16 bg-gray-100 md:py-32">
            <div className="container px-6">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                Privacy-friendly and open source
              </h2>
              <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  Notabase is designed to be an open, transparent, and
                  privacy-friendly platform.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  It&apos;s{' '}
                  <a
                    href="https://github.com/churichard/notabase"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    open source
                  </a>{' '}
                  with a public{' '}
                  <Link href="/changelog">
                    <a className="link">changelog</a>
                  </Link>{' '}
                  and{' '}
                  <a
                    href="https://trello.com/b/dpZLRkRR"
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    roadmap
                  </a>
                  . Development happens transparently, and the entire community
                  is involved.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  You have full ownership over your notes. Notabase will never
                  sell your data or advertise to you.
                </p>
              </div>
            </div>
          </div>
          <div className="py-16 md:py-32">
            <div className="container px-6">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                Pricing
              </h2>
              <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  Notabase is in alpha and is <b>free</b> to use during this
                  time.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  In the future, a paid tier will be added to support
                  Notabase&apos;s development. If you&apos;d like to support my
                  work in the meantime, you can{' '}
                  <a
                    href="https://github.com/sponsors/churichard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    sponsor me on GitHub
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
          <div className="container my-8">
            <div className="px-8 py-12 bg-primary-50 lg:py-16 lg:px-16 md:flex md:items-center md:justify-between xl:rounded-md">
              <div>
                <h2 className="text-2xl font-medium text-primary-900 lg:text-3xl">
                  Write the way you think.
                </h2>
                <h2 className="mt-1 text-2xl font-medium text-primary-600 lg:text-3xl">
                  Start your personal knowledge base today.
                </h2>
              </div>
              <div className="mt-8 md:flex-shrink-0 md:mt-0">
                <Link href="/signup">
                  <a className="btn">Start your knowledge base</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
