import Head from 'next/head';
import LandingLayout from 'components/landing/LandingLayout';
import PricingPlans from 'components/PricingPlans';

export default function Pricing() {
  return (
    <LandingLayout>
      <Head>
        <title>Pricing | Notabase</title>
      </Head>
      <div className="container px-6 pt-12 pb-16">
        <h1 className="text-5xl font-semibold text-center">Pricing</h1>
        <PricingPlans />
      </div>
    </LandingLayout>
  );
}
