import Link from 'next/link';
import Image from 'next/image';
import { IconArrowRight } from '@tabler/icons';
import Footer from 'components/landing/Footer';
import Navbar from 'components/landing/Navbar';
import LandingLayout from 'components/landing/LandingLayout';
import GraphViewImage from 'public/graph-view.png';
import SidebarImage from 'public/sidebar.png';
import PageStackingImage from 'public/page-stacking.png';

export default function Home() {
  return (
    <LandingLayout showNavbar={false} showFooter={false}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <div className="shadow-sm bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50">
            <Navbar />
            <div className="pt-10 pb-16 md:pb-32 md:pt-24">
              <div className="container px-6 text-center">
                <h1 className="text-4xl font-semibold leading-tight text-gray-900 md:leading-tight md:text-5xl">
                  Think more clearly. Be more productive.
                </h1>
                <p className="max-w-3xl pt-6 mx-auto text-xl text-gray-700 md:pt-8 md:text-2xl">
                  Notabase is a powerful and easy-to-use note-taking app.
                  Connect your ideas together and write more effortlessly.
                </p>
                <Link href="/signup">
                  <a className="inline-flex items-center mt-6 md:mt-8 btn hover:shadow-lg group">
                    Take better notes{' '}
                    <IconArrowRight
                      size={18}
                      className="ml-1 group-hover:animate-bounce-x"
                    />
                  </a>
                </Link>
                <video
                  className="mx-auto mt-8 rounded-md md:mt-16 shadow-popover bg-gray-50"
                  width={1200}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                >
                  <source src="/demo.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 md:pt-32 md:pb-16">
            <div className="container flex flex-col items-center px-6 md:flex-row">
              <div className="flex-1 md:mx-8">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Never lose context
                </h2>
                <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                  <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    Link your notes together to form your own, personal
                    knowledge graph.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    The more you write and link, the more powerful it gets.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    Keep sight of the bigger picture. Never again have isolated,
                    hard-to-find notes.
                  </p>
                </div>
              </div>
              <div className="relative flex items-center justify-center flex-1 w-full mt-12 md:mt-0 md:mx-8">
                <div className="flex w-3/4 overflow-hidden rounded-md shadow-md">
                  <Image
                    src={GraphViewImage}
                    alt="Graph view showing how notes are connected to each other"
                    placeholder="blur"
                    quality={100}
                  />
                </div>
                <div className="absolute left-0 right-0 w-full transform rounded-md shadow-sm top-10 bottom-10 bg-primary-50 -rotate-3 -z-10" />
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container flex flex-col items-center px-6 md:flex-row">
              <div className="flex-1 md:mx-8">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Organize the way you want
                </h2>
                <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                  <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    Organize your notes to suit the way you think.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    Link your notes together and traverse them like webpages.
                    Tag important topics and concepts. Drag and drop your notes
                    to create your own hierarchy.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    And for the little things that slip through the cracks, find
                    them with our full-text search.
                  </p>
                </div>
              </div>
              <div className="relative flex items-center justify-center flex-1 w-full mt-12 md:mt-0 md:mx-8">
                <div className="flex overflow-hidden rounded-md shadow-md">
                  <Image
                    src={SidebarImage}
                    alt="Sidebar showing how notes can be nested underneath each other to form a hierarchy"
                    placeholder="blur"
                    quality={100}
                  />
                </div>
                <div className="absolute left-0 right-0 mx-auto transform rounded-md shadow-sm lg:w-3/4 top-14 bottom-14 bg-yellow-50 rotate-3 -z-10" />
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container flex flex-col items-center px-6 md:flex-row">
              <div className="flex-1 md:mx-8">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Focus and explore
                </h2>
                <div className="max-w-3xl pt-6 mx-auto md:pt-8">
                  <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    When you want to write, the clean and intuitive interface
                    lets you focus and get into flow.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    When you want to reflect, stacked pages let you reference
                    multiple notes at once and dive into rabbit holes.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                    Notabase makes both focus and exploration easy and
                    delightful.
                  </p>
                </div>
              </div>
              <div className="relative flex items-center justify-center flex-1 w-full mt-12 md:mt-0 md:mx-8">
                <div className="flex w-5/6 overflow-hidden rounded-md shadow-md">
                  <Image
                    src={PageStackingImage}
                    alt="Page stacking feature that lets you reference multiple notes at once and multitask more easily"
                    placeholder="blur"
                    quality={100}
                  />
                </div>
                <div className="absolute left-0 right-0 w-full transform rounded-md shadow-sm top-10 bottom-10 bg-blue-50 -rotate-3 -z-10" />
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container relative max-w-3xl px-6 mx-auto">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                Privacy-friendly and open source
              </h2>
              <div className="pt-6 md:pt-8">
                <p className="text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  Notabase is open source with a public changelog and roadmap.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  We also have a{' '}
                  <a
                    href="https://discord.gg/BQKNRu7nv5"
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Discord community
                  </a>{' '}
                  where you can give feedback and ask questions.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-gray-700 md:text-xl md:leading-relaxed">
                  You have full ownership over your notes and can export them at
                  any time. We will never sell your data or use it for
                  advertising.
                </p>
                <svg
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute bottom-0 right-0 w-64 md:w-80 -z-10"
                >
                  <path
                    fill="#F5F3FF"
                    d="M69,-23.8C77.8,4.6,65.3,38.6,44.2,51.8C23.1,65,-6.5,57.3,-29.8,40.5C-53.1,23.7,-70.1,-2.3,-64.1,-26.9C-58.1,-51.5,-29,-74.7,0.5,-74.9C30.1,-75,60.2,-52.2,69,-23.8Z"
                    transform="translate(100 100)"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container px-6">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                What can you do with Notabase?
              </h2>
              <div className="grid gap-6 pt-8 md:grid-cols-3 md:pt-10">
                <div className="p-8 rounded-md shadow bg-green-50">
                  <h3 className="text-xl font-semibold">
                    Create a digital garden
                  </h3>
                  <p className="pt-1">
                    Cultivate a personal space for your ideas, thoughts, and
                    evergreen notes, like{' '}
                    <a
                      className="link"
                      href="https://notes.andymatuschak.org/About_these_notes"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Andy Matuschak
                    </a>{' '}
                    and{' '}
                    <a
                      className="link"
                      href="https://www.mentalnodes.com/about"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Anne-Laure Le Cunff
                    </a>
                    .
                  </p>
                </div>
                <div className="p-8 rounded-md shadow bg-purple-50">
                  <h3 className="text-xl font-semibold">
                    Build a personal knowledge base
                  </h3>
                  <p className="pt-1">
                    Create a knowledge center that you can reference at any
                    time, all of it interconnected just like in your brain.
                  </p>
                </div>
                <div className="p-8 rounded-md shadow bg-green-50">
                  <h3 className="text-xl font-semibold">
                    Remember what you read
                  </h3>
                  <p className="pt-1">
                    Take notes while you read, connect ideas with your existing
                    knowledge, and synthesize everything.
                  </p>
                </div>
                <div className="p-8 rounded-md shadow bg-purple-50">
                  <h3 className="text-xl font-semibold">
                    Create a daily journal
                  </h3>
                  <p className="pt-1">
                    Record your thoughts and feelings, keep track of your
                    accomplishments, and reflect on each day.
                  </p>
                </div>
                <div className="p-8 rounded-md shadow bg-green-50">
                  <h3 className="text-xl font-semibold">
                    Manage your projects
                  </h3>
                  <p className="pt-1">
                    Create to-do lists, record institutional knowledge, write
                    marketing copy, and plan for the future.
                  </p>
                </div>
                <div className="p-8 rounded-md shadow bg-purple-50">
                  <h3 className="text-xl font-semibold">Make a help center*</h3>
                  <p className="pt-1">
                    Set up a help center for your product or company in minutes.
                    No coding or design required.
                  </p>
                  <p className="pt-1 text-xs text-gray-500">
                    *Coming soon with Notabase Publish
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container px-6">
              <h2 className="text-3xl font-semibold text-center md:text-4xl">
                People ❤️ Notabase
              </h2>
              <div className="pt-10 space-y-12 text-center md:pt-12">
                <p className="text-2xl italic leading-normal">
                  &ldquo;This is{' '}
                  <span className="font-semibold bg-yellow-100">
                    great for beginners and those who are not so techie
                  </span>{' '}
                  because of it&apos;s simple, minimalist and no-frills
                  design.&rdquo;
                </p>
                <p className="text-2xl italic leading-normal">
                  &ldquo;I can&apos;t believe you single-handedly built this
                  beautiful app. Great job brother!{' '}
                  <span className="font-semibold bg-yellow-100">
                    It&apos;s really snappy!
                  </span>
                  &rdquo;
                </p>
                <p className="text-2xl italic leading-normal">
                  &ldquo;Migrant here—have gone through almost all the apps out
                  there, most recently Roam/Craft/Mem/Obsidian. Strangely, even
                  just an hour or so in, I&apos;m getting a sense Notabase is
                  already fulfilling a lot of what I&apos;m looking for : OS
                  interoperability; Markdown exports; clean UI.{' '}
                  <span className="font-semibold bg-yellow-100">
                    All of those other apps have faltered in one way or another.
                  </span>
                  &rdquo;
                </p>
                <p className="text-2xl italic leading-normal">
                  &ldquo;Just tested this application today,{' '}
                  <span className="font-semibold bg-yellow-100">
                    love how clean it looks!
                  </span>
                  &rdquo;
                </p>
                <p className="text-2xl italic leading-normal">
                  &ldquo;Looks{' '}
                  <span className="font-semibold bg-yellow-100">
                    neat, fresh, and clean.
                  </span>{' '}
                  Love minimalist style.&rdquo;
                </p>
              </div>
            </div>
          </div>
          <div className="container my-8 shadow-md bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50 sm:rounded-md">
            <div className="px-8 py-12 md:space-x-6 lg:py-16 lg:px-16 md:flex md:items-center md:justify-between">
              <div>
                <p className="text-2xl font-medium text-primary-900 lg:text-3xl">
                  Think more clearly. Be more productive.
                </p>
                <p className="mt-1 text-2xl font-medium text-primary-600 lg:text-3xl">
                  Start taking better notes today.
                </p>
              </div>
              <div className="mt-8 md:flex-shrink-0 md:mt-0">
                <Link href="/signup">
                  <a className="inline-flex items-center btn group">
                    Get started for free{' '}
                    <IconArrowRight
                      size={18}
                      className="ml-1 group-hover:animate-bounce-x"
                    />
                  </a>
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
