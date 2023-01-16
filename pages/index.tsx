import Link from 'next/link';
import Image from 'next/image';
import {
  IconArrowRight,
  IconBrandGithub,
  IconDatabase,
  IconMessage,
} from '@tabler/icons';
import Footer from 'components/landing/Footer';
import Navbar from 'components/landing/Navbar';
import LandingLayout from 'components/landing/LandingLayout';
import GraphViewImage from 'public/graph-view.png';
import SidebarImage from 'public/sidebar.png';
import PageStackingImage from 'public/page-stacking.png';
import PricingPlans from 'components/PricingPlans';
import PricingFaq from 'components/PricingFaq';

export default function Home() {
  return (
    <LandingLayout showNavbar={false} showFooter={false}>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <div className="bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50 shadow-sm">
            <Navbar />
            <div className="py-16 md:py-24">
              <div className="container px-6 text-center">
                <h1 className="text-4xl font-semibold leading-tight text-gray-900 md:text-5xl md:leading-tight">
                  Think more clearly. Be more productive.
                </h1>
                <p className="mx-auto max-w-3xl pt-6 text-xl text-gray-700 md:pt-8 md:text-2xl">
                  Notabase is a powerful and easy-to-use note-taking app.
                  Connect your ideas together and write more effortlessly.
                </p>
                <Link
                  href="/signup"
                  className="btn group mt-6 inline-flex items-center hover:shadow-lg md:mt-8"
                >
                  Take better notes{' '}
                  <IconArrowRight
                    size={18}
                    className="ml-1 group-hover:animate-bounce-x"
                  />
                </Link>
                <video
                  className="mx-auto mt-8 rounded-md bg-gray-50 shadow-popover md:mt-16"
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
            <div className="container flex flex-col items-center px-6 md:flex-row md:space-x-8">
              <div className="flex-1">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Never lose context
                </h2>
                <div className="mx-auto max-w-3xl pt-6 md:pt-8">
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
              <div className="relative mt-12 flex w-full flex-1 items-center justify-center md:mt-0">
                <div className="flex w-3/4 overflow-hidden rounded-md shadow-md">
                  <Image
                    src={GraphViewImage}
                    alt="Graph view showing how notes are connected to each other"
                    placeholder="blur"
                    quality={100}
                  />
                </div>
                <div className="absolute left-0 right-0 top-10 bottom-10 -z-10 w-full -rotate-3 transform rounded-md bg-primary-50 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container flex flex-col items-center px-6 md:flex-row md:space-x-8">
              <div className="flex-1">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Organize the way you want
                </h2>
                <div className="mx-auto max-w-3xl pt-6 md:pt-8">
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
              <div className="relative mt-12 flex w-full flex-1 items-center justify-center md:mt-0">
                <div className="flex overflow-hidden rounded-md shadow-md">
                  <Image
                    src={SidebarImage}
                    alt="Sidebar showing how notes can be nested underneath each other to form a hierarchy"
                    placeholder="blur"
                    quality={100}
                  />
                </div>
                <div className="absolute left-0 right-0 top-14 bottom-14 -z-10 mx-auto rotate-3 transform rounded-md bg-yellow-50 shadow-sm lg:w-3/4" />
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container flex flex-col items-center px-6 md:flex-row md:space-x-8">
              <div className="flex-1">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Focus and explore
                </h2>
                <div className="mx-auto max-w-3xl pt-6 md:pt-8">
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
              <div className="relative mt-12 flex w-full flex-1 items-center justify-center md:mt-0">
                <div className="flex w-5/6 overflow-hidden rounded-md shadow-md">
                  <Image
                    src={PageStackingImage}
                    alt="Page stacking feature that lets you reference multiple notes at once and multitask more easily"
                    placeholder="blur"
                    quality={100}
                  />
                </div>
                <div className="absolute left-0 right-0 top-10 bottom-10 -z-10 w-full -rotate-3 transform rounded-md bg-blue-50 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container relative mx-auto px-6">
              <h2 className="text-center text-3xl font-semibold md:text-4xl">
                Open and transparent
              </h2>
              <div className="flex flex-col space-y-8 pt-6 md:flex-row md:space-x-8 md:space-y-0 md:pt-8">
                <div className="flex-1">
                  <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-100">
                    <IconMessage className="text-primary-700" />
                  </div>
                  <p className="mt-4 flex items-center text-xl font-semibold">
                    Community
                  </p>
                  <p className="mt-2 text-lg leading-relaxed text-gray-700">
                    Join our open{' '}
                    <a
                      href="https://discord.gg/BQKNRu7nv5"
                      className="link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Discord community
                    </a>
                    ! You can give feedback, ask questions, or discuss
                    note-taking strategies.
                  </p>
                </div>
                <div className="flex-1">
                  <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-100">
                    <IconDatabase className="text-primary-700" />
                  </div>
                  <p className="mt-4 flex items-center text-xl font-semibold">
                    You own your data
                  </p>
                  <p className="mt-2 text-lg leading-relaxed text-gray-700">
                    You have full ownership over your notes and can export them
                    at any time. We will never sell your data or use it for
                    advertising.
                  </p>
                </div>
                <div className="flex-1">
                  <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-100">
                    <IconBrandGithub className="text-primary-700" />
                  </div>
                  <p className="mt-4 flex items-center text-xl font-semibold">
                    Open source
                  </p>
                  <p className="mt-2 text-lg leading-relaxed text-gray-700">
                    Contribute to our development! Notabase is open source with
                    a public roadmap.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container px-6">
              <h2 className="text-center text-3xl font-semibold md:text-4xl">
                What can you do with Notabase?
              </h2>
              <div className="grid gap-6 pt-6 md:grid-cols-3 md:pt-8">
                <div className="rounded-md bg-green-50 p-8 shadow">
                  <h3 className="text-xl font-semibold">
                    Create a digital garden
                  </h3>
                  <p className="pt-2">
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
                <div className="rounded-md bg-purple-50 p-8 shadow">
                  <h3 className="text-xl font-semibold">
                    Build a personal knowledge base
                  </h3>
                  <p className="pt-2">
                    Create a knowledge center that you can reference at any
                    time, all of it interconnected just like in your brain.
                  </p>
                </div>
                <div className="rounded-md bg-green-50 p-8 shadow">
                  <h3 className="text-xl font-semibold">
                    Remember what you read
                  </h3>
                  <p className="pt-2">
                    Take notes while you read, connect ideas with your existing
                    knowledge, and synthesize everything.
                  </p>
                </div>
                <div className="rounded-md bg-purple-50 p-8 shadow">
                  <h3 className="text-xl font-semibold">
                    Create a daily journal
                  </h3>
                  <p className="pt-2">
                    Record your thoughts and feelings, keep track of your
                    accomplishments, and reflect on each day.
                  </p>
                </div>
                <div className="rounded-md bg-green-50 p-8 shadow">
                  <h3 className="text-xl font-semibold">
                    Manage your projects
                  </h3>
                  <p className="pt-2">
                    Create to-do lists, record institutional knowledge, write
                    marketing copy, and plan for the future.
                  </p>
                </div>
                <div className="rounded-md bg-purple-50 p-8 shadow">
                  <h3 className="text-xl font-semibold">Make a help center*</h3>
                  <p className="pt-2">
                    Set up a help center for your product or company in minutes.
                    No coding or design required.
                  </p>
                  <p className="pt-2 text-xs text-gray-500">
                    *Coming soon with Notabase Publish
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container px-6">
              <h2 className="text-center text-3xl font-semibold md:text-4xl">
                Pricing
              </h2>
              <p className="mt-4 text-center text-2xl text-gray-500">
                Simple & straightforward pricing
              </p>
              <PricingPlans />
              <PricingFaq className="pt-12 sm:pt-16 lg:pt-24" />
            </div>
          </div>
          <div className="py-8 md:py-16">
            <div className="container px-6">
              <h2 className="text-center text-3xl font-semibold md:text-4xl">
                People 💚 Notabase
              </h2>
              <div className="mx-auto max-w-3xl space-y-10 pt-6 text-center md:pt-8">
                <p className="text-xl italic leading-normal">
                  &ldquo;This is{' '}
                  <span className="bg-yellow-100 font-semibold">
                    great for beginners and those who are not so techie
                  </span>{' '}
                  because of it&apos;s simple, minimalist and no-frills
                  design.&rdquo;
                </p>
                <p className="text-xl italic leading-normal">
                  &ldquo;I can&apos;t believe you single-handedly built this
                  beautiful app. Great job brother!{' '}
                  <span className="bg-yellow-100 font-semibold">
                    It&apos;s really snappy!
                  </span>
                  &rdquo;
                </p>
                <p className="text-xl italic leading-normal">
                  &ldquo;Migrant here—have gone through almost all the apps out
                  there, most recently Roam / Craft / Mem / Obsidian.{' '}
                  <span className="bg-yellow-100 font-semibold">
                    Strangely, even just an hour or so in, I&apos;m getting a
                    sense Notabase is already fulfilling a lot of what I&apos;m
                    looking for
                  </span>
                  : OS interoperability; Markdown exports; clean UI. All of
                  those other apps have faltered in one way or another.&rdquo;
                </p>
                <p className="text-xl italic leading-normal">
                  &ldquo;Just tested this application today,{' '}
                  <span className="bg-yellow-100 font-semibold">
                    love how clean it looks!
                  </span>
                  &rdquo;
                </p>
                <p className="text-xl italic leading-normal">
                  &ldquo;Looks{' '}
                  <span className="bg-yellow-100 font-semibold">
                    neat, fresh, and clean.
                  </span>{' '}
                  Love minimalist style.&rdquo;
                </p>
              </div>
            </div>
          </div>
          <div className="container my-8 bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50 shadow-md sm:rounded-md">
            <div className="px-8 py-12 md:flex md:items-center md:justify-between md:space-x-6 lg:py-16 lg:px-16">
              <div>
                <p className="text-2xl font-medium text-primary-900 lg:text-3xl">
                  Think more clearly. Be more productive.
                </p>
                <p className="mt-1 text-2xl font-medium text-primary-600 lg:text-3xl">
                  Start taking better notes today.
                </p>
              </div>
              <div className="mt-8 md:mt-0 md:flex-shrink-0">
                <Link
                  href="/signup"
                  className="btn group inline-flex items-center"
                >
                  Get started for free{' '}
                  <IconArrowRight
                    size={18}
                    className="ml-1 group-hover:animate-bounce-x"
                  />
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
