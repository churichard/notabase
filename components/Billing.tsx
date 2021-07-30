import { useCallback, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js/pure';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { Plan, PlanId, PRICING_PLANS } from 'constants/pricing';
import { useAuth } from 'utils/useAuth';
import { SubscriptionContextType, useBilling } from 'utils/useBilling';
import { SubscriptionStatus } from 'types/supabase';
import PricingTable from './PricingTable';

export default function Billing() {
  const { user } = useAuth();
  const { subscription } = useBilling();
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
          userId: user?.id,
          userEmail: user?.email,
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
    [router, user]
  );

  const onChangePlan = useCallback(async () => {
    // Create stripe billing portal session
    const res = await fetch('/api/create-billing-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user?.id,
        redirectPath: router.asPath,
      }),
    });

    if (res.ok) {
      // Redirect to stripe billing portal page
      const { sessionUrl } = await res.json();
      window.location.href = sessionUrl;
    } else {
      toast.error('Error creating billing portal session');
    }
  }, [router, user]);

  const pricingButtons = useMemo(() => {
    const currentPlanId =
      subscription &&
      subscription.subscriptionStatus === SubscriptionStatus.Active
        ? subscription.planId
        : PlanId.Basic;

    if (currentPlanId === PlanId.Pro) {
      return [
        () => (
          <button className="block w-full px-4 py-2 btn" onClick={onChangePlan}>
            Switch plan
          </button>
        ),
        () => (
          <div className="block w-full px-4 py-2 text-center text-gray-600 border rounded">
            Current plan
          </div>
        ),
      ];
    } else {
      return [
        () => (
          <div className="block w-full px-4 py-2 text-center text-gray-600 border rounded">
            Current plan
          </div>
        ),
        (showMonthly: boolean) => (
          <button
            className="block w-full px-4 py-2 btn"
            onClick={() => onSubscribe(PRICING_PLANS.pro, showMonthly)}
          >
            Upgrade
          </button>
        ),
      ];
    }
  }, [onSubscribe, subscription, onChangePlan]);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <BillingBanner subscription={subscription} onChangePlan={onChangePlan} />
      <PricingTable buttons={pricingButtons} />
    </div>
  );
}

type BillingBannerProps = {
  subscription: SubscriptionContextType | null;
  onChangePlan: () => void;
};

const BillingBanner = (props: BillingBannerProps) => {
  const { subscription, onChangePlan } = props;

  if (!subscription) {
    return null;
  }

  if (
    subscription.cancelAtPeriodEnd &&
    subscription.subscriptionStatus === SubscriptionStatus.Active
  ) {
    // Subscription is cancelling at the end of the current period
    return (
      <p className="p-4 mb-6 text-lg border rounded bg-primary-50 border-primary-200">
        Your subscription will be cancelled at the end of your billing period on{' '}
        {getReadableDate(subscription.currentPeriodEnd)}. If you&apos;d like to
        renew your plan,{' '}
        <button onClick={onChangePlan} className="link">
          click here
        </button>
        .
      </p>
    );
  } else if (
    !subscription.cancelAtPeriodEnd &&
    subscription.subscriptionStatus === SubscriptionStatus.Active
  ) {
    // Subscription is renewing at the end of the current period
    return (
      <p className="p-4 mb-6 text-lg border rounded bg-primary-50 border-primary-200">
        Your subscription will renew at the end of your billing period on{' '}
        {getReadableDate(subscription.currentPeriodEnd)}. If you&apos;d like to
        edit your billing details,{' '}
        <button onClick={onChangePlan} className="link">
          click here
        </button>
        .
      </p>
    );
  } else {
    // No current subscription
    return null;
  }
};

const getReadableDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
