import Head from 'next/head';
import Link from 'next/link';
import Footer from 'components/landing/Footer';

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
          <div className="container flex items-center justify-between px-6 py-6 space-x-6 text-gray-900">
            <Link href="/">
              <a className="text-xl">Notabase</a>
            </Link>
            <div className="flex items-center space-x-6">
              <a
                href="https://github.com/churichard/notabase"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <div className="h-5 border-l" />
              <Link href="/login">
                <a>Sign in</a>
              </Link>
              <Link href="/signup">
                <a className="font-medium btn">Get started</a>
              </Link>
            </div>
          </div>
          <div className="py-16 md:py-32">
            <div className="container px-6 text-center">
              <h1 className="text-5xl font-medium md:text-6xl">
                A wiki for your ideas.
              </h1>
              <p className="pt-4 text-2xl text-gray-700 md:pt-8 md:text-3xl">
                Notabase is a personal knowledge base for networked thinking.
              </p>
              <Link href="/signup">
                <a className="inline-block mt-4 font-medium md:mt-8 btn">
                  Start your knowledge base
                </a>
              </Link>
              <video
                className="hidden mx-auto mt-8 rounded md:mt-16 shadow-popover md:block"
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
              <h2 className="text-3xl font-medium text-center md:text-4xl">
                Link your knowledge together
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="pt-4 text-lg leading-loose text-gray-700 md:pt-8 md:text-xl md:leading-loose">
                  Your brain stores information as a network, not as a
                  collection of files and folders. With Notabase, you make
                  <span className="text-primary-600">
                    {' '}
                    [[connections]]
                  </span>{' '}
                  between notes and organize knowledge associatively. This lets
                  you perceive relationships between pieces of knowledge that
                  may not be apparent in isolation.
                </p>
              </div>
            </div>
          </div>
          <div className="py-16 md:py-32">
            <div className="container px-6">
              <h2 className="text-3xl font-medium text-center md:text-4xl">
                Write in rich text as you type
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="pt-4 text-lg leading-loose text-gray-700 md:pt-8 md:text-xl md:leading-loose">
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
              <h2 className="text-3xl font-medium text-center md:text-4xl">
                Open source
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="pt-4 text-lg leading-loose text-gray-700 md:pt-8 md:text-xl md:leading-loose">
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
              <h2 className="text-3xl font-medium text-center md:text-4xl">
                Pricing
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="pt-4 text-lg leading-loose text-gray-700 md:pt-8 md:text-xl md:leading-loose">
                  Notabase is currently <b>free</b> to use while in alpha. In
                  the future, a paid tier will be added in order to cover the
                  costs of hosting and development (but there will always be a
                  generous free tier).
                </p>
              </div>
            </div>
          </div>
          <div className="py-16 md:py-32 bg-primary-50">
            <div className="container px-6 text-center">
              <h2 className="text-4xl font-medium md:text-5xl">
                A wiki for your ideas.
              </h2>
              <p className="pt-4 text-2xl text-gray-700 md:pt-8 md:text-3xl">
                Start your personal knowledge base today.
              </p>
              <Link href="/signup">
                <a className="inline-block mt-4 font-medium md:mt-8 btn">
                  Sign up
                </a>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
