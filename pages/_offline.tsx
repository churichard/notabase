import Head from 'next/head';
import { IconWifiOff } from '@tabler/icons';

export default function Offline() {
  return (
    <>
      <Head>
        <title>You&apos;re offline | Notabase</title>
      </Head>
      <div className="flex flex-col items-center justify-center flex-1 h-screen p-4">
        <IconWifiOff
          size={64}
          className="p-2 text-white bg-yellow-500 rounded-full"
        />
        <p className="mt-4 text-2xl text-center">
          It looks like you&apos;re offline. To view this page, please reconnect
          to the Internet.
        </p>
      </div>
    </>
  );
}
