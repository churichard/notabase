import Head from 'next/head';
import Link from 'next/link';
import Footer from 'components/landing/Footer';
import Navbar from 'components/landing/Navbar';

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Notabase | A personal knowledge base for networked thinking.
        </title>
      </Head>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-1">
          <Navbar />
          <div className="py-16 md:py-32">
            <div className="container px-6 text-center">
              <h1 className="text-4xl font-semibold leading-tight md:leading-tight md:text-5xl">
                Networked notes for your research and ideas.
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
                className="hidden mx-auto mt-8 rounded-md md:mt-16 shadow-popover md:block"
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
            <div className="container px-6">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                Link your knowledge together
              </h2>
              <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                <p className="text-lg leading-loose text-gray-700 md:text-xl md:leading-loose">
                  Your brain stores information as a network, not as a
                  collection of files and folders. With Notabase, you make{' '}
                  <b>[[connections]]</b> between notes and organize knowledge
                  associatively. This lets you perceive relationships between
                  pieces of knowledge that may not be apparent in isolation.
                </p>
              </div>
            </div>
          </div>
          <div className="py-16 md:py-32">
            <div className="container px-6">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                Write in rich text as you type
              </h2>
              <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                <p className="text-lg leading-loose text-gray-700 md:text-xl md:leading-loose">
                  You don&apos;t need to be an expert at markdown to be
                  productive with Notabase. With a formatting menu, keyboard
                  shortcuts, and auto-markdown support, you can format your text
                  however you&apos;d like. Everything is converted{' '}
                  <i>effortlessly</i> into <b>rich text</b> as you{' '}
                  <code className="p-0.5 bg-gray-200 rounded text-primary-800">
                    type
                  </code>
                  , making it frictionless to write down your thoughts.
                </p>
              </div>
            </div>
          </div>
          <div className="py-16 bg-gray-100 md:py-32">
            <div className="container px-6">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                Open source
              </h2>
              <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                <p className="text-lg leading-loose text-gray-700 md:text-xl md:leading-loose">
                  Notabase is{' '}
                  <a
                    href="https://github.com/churichard/notabase"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    open source software
                  </a>
                  , which means development happens transparently. The entire
                  community makes the product better by contributing code,
                  reporting bugs, or providing support. And since the source
                  code is public, anyone can build on top of it or host it
                  themselves.
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
                <p className="text-lg leading-loose text-gray-700 md:text-xl md:leading-loose">
                  Notabase is in alpha and is <b>free</b> to use during this
                  time. In the future, a paid tier will be added to support
                  Notabase&apos;s development (but there will always be a
                  generous free tier).
                </p>
                <p className="pt-4 text-lg leading-loose text-gray-700 md:text-xl md:leading-loose">
                  If you&apos;d like to support my work, you can{' '}
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
                  Write the way your brain thinks.
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
