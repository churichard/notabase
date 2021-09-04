import Head from 'next/head';
import Router from 'next/router';
import { ToastContainer } from 'react-toastify';
import NProgress from 'nprogress';
import type { AppProps } from 'next/app';
import { ProvideAuth } from 'utils/useAuth';
import AppLayout from 'components/AppLayout';
import 'styles/styles.css';
import 'styles/nprogress.css';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const DESCRIPTION =
  "Notabase is a personal knowledge base for networked thinking. It's powerful, easy-to-use, and open source.";

export default function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <>
      <Head>
        <title>
          Notabase | A personal knowledge base for networked thinking
        </title>
        <meta name="description" content={DESCRIPTION} />
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta property="og:title" content="Notabase" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="https://notabase.io/banner.png" />
        <meta property="og:url" content="https://notabase.io" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@notabase" />
        <meta name="twitter:title" content="Notabase" />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="https://notabase.io/banner.png" />
        <script
          async
          defer
          data-domain="notabase.io"
          src="https://plausible.io/js/plausible.js"
        ></script>
      </Head>
      <ProvideAuth>
        {router.pathname.startsWith('/app') ? (
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        ) : (
          <Component {...pageProps} />
        )}
      </ProvideAuth>
      <ToastContainer
        position="top-center"
        hideProgressBar
        newestOnTop={true}
        theme="colored"
      />
    </>
  );
}
