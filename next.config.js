/* eslint-disable @typescript-eslint/no-var-requires */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const withPWA = require('next-pwa');

const { withSentryConfig } = require('@sentry/nextjs');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  // Disable sentry if not configured.
  dryRun: process.env.NEXT_PUBLIC_SENTRY_DSN === '',

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return withPWA(
    withSentryConfig(
      withBundleAnalyzer({
        experimental: { esmExternals: true },
        trailingSlash: true,
        pwa: {
          dest: 'public',
          scope: '/app/',
          disable: process.env.NODE_ENV === 'development',
          dynamicStartUrlRedirect: '/login',
          reloadOnOnline: false,
          register: false,
          skipWaiting: false,
        },
        i18n: {
          locales: ['en-US'],
          defaultLocale: 'en-US',
        },
        env: {
          BASE_URL: isDev ? 'http://localhost:3000' : 'https://notabase.io',
        },
      }),
      SentryWebpackPluginOptions
    )
  );
};
