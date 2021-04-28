import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from 'components/landing/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Notabase | A personal knowledge base for non-linear thinking.
        </title>
      </Head>
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="container flex-1 px-6">
          <div className="flex items-center justify-between py-6">
            <Link href="/">
              <a className="text-xl">Notabase</a>
            </Link>
            <div className="space-x-6">
              <a
                href="https://github.com/churichard/notabase"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <Link href="/login">
                <a>Sign in</a>
              </Link>
            </div>
          </div>
          <div className="pt-16 text-center md:pt-32">
            <h1 className="text-4xl font-medium md:text-6xl">
              A wiki for your brain.
            </h1>
            <p className="pt-4 text-2xl text-gray-700 md:pt-8 md:text-3xl">
              Notabase is a personal knowledge base for non-linear thinking.
            </p>
            <Link href="/signup">
              <a className="inline-block mt-4 font-medium md:mt-8 btn">
                Start your knowledge base
              </a>
            </Link>
          </div>
        </div>
        <Footer className="mt-16 md:mt-32" />
      </div>
    </>
  );
}
