import Head from 'next/head';
import AppLayout from 'components/AppLayout';

export default function AppHome() {
  return (
    <>
      <Head>
        <title>Notabase</title>
      </Head>
      <AppLayout>
        <div className="flex items-center justify-center w-full p-12">
          <p className="text-gray-500">Get started by adding a new note</p>
        </div>
      </AppLayout>
    </>
  );
}
