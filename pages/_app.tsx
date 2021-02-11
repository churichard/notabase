import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'styles/styles.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}
