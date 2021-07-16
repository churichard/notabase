import Head from 'next/head';

export default function AppHome() {
  return (
    <>
      <Head>
        <title>Notabase</title>
      </Head>
      <div className="flex items-center justify-center flex-1 w-full p-12">
        <p className="text-gray-500">Get started by adding a new note</p>
      </div>
    </>
  );
}
