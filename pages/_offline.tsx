import Head from 'next/head';
import { IconWifiOff } from '@tabler/icons';

export default function Offline() {
  return (
    <>
      <Head>
        <title>You&apos;re offline | Notabase</title>
      </Head>
      <div className="flex h-screen flex-1 flex-col items-center justify-center p-4">
        <IconWifiOff
          size={64}
          className="rounded-full bg-yellow-500 p-2 text-white"
        />
        <p className="mt-4 text-center text-2xl">
          It looks like you&apos;re offline. To view this page, please reconnect
          to the Internet.
        </p>
      </div>
    </>
  );
}
