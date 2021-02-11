import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="flex items-center h-screen bg-blue-50">
      <Head>
        <title>
          Atomic | A personal knowledge base for non-linear thinking.
        </title>
      </Head>
      <div className="container px-4 py-8">
        <div className="max-w-7xl">
          <h1 className="text-4xl font-medium md:text-6xl">
            Atomic is a personal knowledge base for non-linear thinking.
          </h1>
          <h2 className="mt-4 text-2xl text-gray-700 md:mt-8 md:text-4xl">
            Coming soon.
          </h2>
        </div>
      </div>
    </div>
  );
}
