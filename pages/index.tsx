import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Notabase | A personal knowledge base for non-linear thinking.
        </title>
      </Head>
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="px-6 mx-auto max-w-8xl">
          <div className="container flex justify-between py-6">
            <Link href="/">
              <a className="text-xl">Notabase</a>
            </Link>
            <Link href="/login">
              <a className="text-lg">Sign in</a>
            </Link>
          </div>
          <div className="container py-16 text-center md:py-32">
            <h1 className="text-4xl font-medium md:text-6xl">
              A wiki for your brain.
            </h1>
            <h2 className="mt-4 text-2xl text-gray-700 md:mt-8 md:text-4xl">
              Notabase is a personal knowledge base for non-linear thinking.
            </h2>
            <Link href="/signup">
              <a className="inline-block mt-4 font-medium md:mt-8 btn">
                Start your knowledge base
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
