import { useCallback, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js/pure';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { Plan, plans } from 'constants/pricing';
import PricingTable from './PricingTable';

export default function Billing() {
  const router = useRouter();

  const onSubscribe = useCallback(
    async (plan: Plan, showMonthly: boolean) => {
      // Create stripe checkout session
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectPath: router.asPath,
          priceId: showMonthly
            ? plan.prices.monthly.priceId
            : plan.prices.annual.priceId,
        }),
      });

      if (res.ok) {
        const { sessionId } = await res.json();

        // Redirect to stripe checkout page
        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
        );
        await stripe?.redirectToCheckout({ sessionId });
      } else {
        toast.error('Error creating checkout session');
      }
    },
    [router]
  );

  const pricingButtons = useMemo(() => {
    return [
      () => (
        <div className="w-full px-4 py-2 text-center text-gray-600 border rounded">
          Current plan
        </div>
      ),
      (showMonthly: boolean) => (
        <button
          className="w-full px-4 py-2 btn"
          onClick={() => onSubscribe(plans.pro, showMonthly)}
        >
          Upgrade
        </button>
      ),
    ];
  }, [onSubscribe]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <PricingTable buttons={pricingButtons} />
    </div>
  );
}
