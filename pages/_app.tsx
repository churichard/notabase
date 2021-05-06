import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { ToastContainer } from 'react-toastify';
import NProgress from 'nprogress';
import { ProvideAuth } from 'utils/useAuth';
import 'styles/styles.css';
import 'styles/nprogress.css';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>
      <ProvideAuth>
        <Component {...pageProps} />
      </ProvideAuth>
      <ToastContainer
        position="top-center"
        hideProgressBar
        newestOnTop={true}
      />
    </>
  );
}
