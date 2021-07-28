import Link from 'next/link';
import Footer from 'components/landing/Footer';
import Navbar from 'components/landing/Navbar';
import LandingLayout from 'components/landing/LandingLayout';

export default function Home() {
  return (
    <LandingLayout showNavbar={false} showFooter={false}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <div className="bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50">
            <Navbar />
            <div className="pt-10 pb-16 md:pb-32 md:pt-24">
              <div className="container px-6 text-center">
                <h1 className="text-4xl font-semibold leading-tight text-gray-900 md:leading-tight md:text-5xl">
                  Empower your writing, research, and ideas
                </h1>
                <p className="pt-6 text-2xl text-gray-700 md:pt-8 md:text-3xl">
                  Notabase is a personal knowledge base for networked thinking.
                </p>
                <Link href="/signup">
                  <a className="inline-block mt-6 md:mt-8 btn hover:shadow-lg">
                    Start your knowledge base
                  </a>
                </Link>
                <video
                  className="hidden mx-auto mt-8 rounded-md md:mt-16 shadow-popover md:block"
                  width={1200}
                  autoPlay
                  loop
                  muted
                >
                  <source src="/demo.mp4" type="video/mp4" />
                </video>
                <video
                  className="block mx-auto mt-8 rounded-md md:mt-16 shadow-popover md:hidden"
                  width={500}
                  autoPlay
                  loop
                  muted
                >
                  <source src="/demo_mobile.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 md:pt-32 md:pb-16">
            <div className="container flex flex-col items-center px-6 md:flex-row">
              <div className="flex-1 md:mx-8">
                <h2 className="text-3xl font-semibold md:text-4xl">
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
                    When you reference a note, relevant notes will surface
                    naturally. Never lose sight of the bigger picture.
                  </p>
                </div>
              </div>
              <div className="relative flex-1 px-6 mt-12 md:mt-0 md:mx-8 lg:px-8 xl:px-0">
                <video
                  className="mx-auto rounded-md shadow-popover"
                  width={400}
                  autoPlay
                  loop
                  muted
                >
                  <source src="/graph.mp4" type="video/mp4" />
                </video>
                <div className="absolute left-0 right-0 w-full transform rounded-md top-14 bottom-14 bg-primary-50 -rotate-3 -z-10" />
              </div>
            </div>
          </div>
          <div className="pt-8 pb-16 md:pb-32 md:pt-16">
            <div className="container flex flex-col items-center px-6 md:flex-row">
              <div className="relative flex-1 order-1 px-6 mt-12 md:order-none md:mt-0 md:mx-8 lg:px-8 xl:px-0">
                <video
                  className="mx-auto rounded-md shadow-popover"
                  width={400}
                  autoPlay
                  loop
                  muted
                >
                  <source src="/rich_text.mp4" type="video/mp4" />
                </video>
                <div className="absolute left-0 right-0 w-full transform rounded-md top-14 bottom-14 bg-blue-50 rotate-3 -z-10" />
              </div>
              <div className="flex-1 md:mx-8">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Easy to use; it just works
                </h2>
                <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                  <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    With our powerful editor, reading and writing happens in one
                    fluid experience. Never context switch again.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    Your notes are automatically synced across all of your
                    devices, so they&apos;re accessible from anywhere.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    No setup, no hassle&mdash;everything works out of the box.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="py-16 bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50 md:py-32">
            <div className="container px-6">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                Privacy-friendly and open source
              </h2>
              <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  Notabase is an open, transparent, and privacy-friendly
                  platform.
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
          <div className="container my-8 bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50 sm:rounded-md">
            <div className="px-8 py-12 md:space-x-6 lg:py-16 lg:px-16 md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-medium text-primary-900 lg:text-3xl">
                  Empower your writing and thinking.
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
    </LandingLayout>
  );
}
