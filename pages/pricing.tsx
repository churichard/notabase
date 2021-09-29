import Head from 'next/head';
import LandingLayout from 'components/landing/LandingLayout';
import PricingPlans from 'components/PricingPlans';
import PricingFaq from 'components/PricingFaq';

export default function Pricing() {
  return (
    <LandingLayout>
      <Head>
        <title>Pricing | Notabase</title>
      </Head>
      <div className="container px-6 py-16">
        <h1 className="text-5xl font-semibold text-center">Pricing</h1>
        <h2 className="mt-4 text-2xl text-center text-gray-500">
          Simple & straightforward pricing
        </h2>
        <PricingPlans />
        <PricingFaq className="pt-12 sm:pt-16 lg:pt-24" />
      </div>
    </LandingLayout>
  );
}
