/* eslint-disable @typescript-eslint/no-var-requires */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return withBundleAnalyzer({
    i18n: {
      locales: ['en-US'],
      defaultLocale: 'en-US',
    },
    env: {
      BASE_URL: isDev ? 'http://localhost:3000' : 'https://notabase.io',
    },
  });
};
