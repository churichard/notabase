import { useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PricingTable from 'components/PricingTable';
import LandingLayout from 'components/landing/LandingLayout';

export default function Pricing() {
  const pricingButtons = useCallback(() => {
    return [
      <Link key={0} href="/signup">
        <a className="block w-full px-4 py-2 text-center btn">Get started</a>
      </Link>,
      <Link key={1} href="/signup">
        <a className="block w-full px-4 py-2 text-center btn">Try for free</a>
      </Link>,
    ];
  }, []);

  return (
    <LandingLayout>
      <Head>
        <title>Pricing | Notabase</title>
      </Head>
      <div className="container px-6 pt-12 pb-16">
        <h1 className="mb-8 text-5xl font-semibold text-center">Pricing</h1>
        <PricingTable buttons={pricingButtons} />
      </div>
    </LandingLayout>
  );
}
