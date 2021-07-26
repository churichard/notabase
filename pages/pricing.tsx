import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PricingTable from 'components/PricingTable';
import LandingLayout from 'components/landing/LandingLayout';

export default function Pricing() {
  const pricingButtons = useMemo(() => {
    return [
      () => (
        <Link href="/signup">
          <a className="w-full px-4 py-2 btn">Get started</a>
        </Link>
      ),
      () => (
        <Link href="/signup">
          <a className="w-full px-4 py-2 btn">Try for free</a>
        </Link>
      ),
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
