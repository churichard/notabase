/* eslint-disable @typescript-eslint/no-var-requires */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
// TODO: remove this once https://github.com/tabler/tabler-icons/issues/126 is fixed
const withTabler = require('next-transpile-modules')(['@tabler/icons']);

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return withTabler({
    future: {
      webpack5: true,
    },
    env: {
      BASE_URL: isDev ? 'http://localhost:3000' : 'https://notabase.io',
    },
  });
};
