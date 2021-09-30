import { useEffect } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { ToastContainer } from 'react-toastify';
import NProgress from 'nprogress';
import type { AppProps } from 'next/app';
import { ProvideAuth } from 'utils/useAuth';
import AppLayout from 'components/AppLayout';
import ServiceWorker from 'components/ServiceWorker';
import 'styles/styles.css';
import 'styles/nprogress.css';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function MyApp({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    window.plausible =
      window.plausible ||
      function () {
        // eslint-disable-next-line prefer-rest-params
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };
  }, []);

  return (
    <>
      <Head>
        <title>
          Notabase | Powerful and easy-to-use note-taking app for networked
          thinking
        </title>
        <script
          async
          defer
          data-domain="notabase.io"
          src="https://plausible.io/js/plausible.js"
        ></script>
      </Head>
      <ServiceWorker>
        <ProvideAuth>
          {router.pathname.startsWith('/app') ? (
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          ) : (
            <Component {...pageProps} />
          )}
        </ProvideAuth>
      </ServiceWorker>
      <ToastContainer
        position="top-center"
        hideProgressBar
        newestOnTop={true}
        theme="colored"
      />
    </>
  );
}
