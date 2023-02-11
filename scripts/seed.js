/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const seed = async () => {
  const client = new Client(
    'postgres://postgres:postgres@localhost:54322/postgres'
  );

  await client.connect();

  const schema = fs
    .readFileSync(path.resolve(__dirname, './schema.sql'))
    .toString();
  await client.query(schema);

  const seed = fs
    .readFileSync(path.resolve(__dirname, './seed.sql'))
    .toString();
  await client.query(seed);

  await client.end();
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
