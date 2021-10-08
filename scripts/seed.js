const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const seed = async () => {
  const client = new Client(
    'postgres://postgres:postgres@localhost:5432/postgres'
  );

  client.connect();

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
