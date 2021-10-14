import { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js/pure';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { BillingFrequency, PlanId, PRICING_PLANS } from 'constants/pricing';
import { useAuth } from 'utils/useAuth';
import { BillingDetails, useStore } from 'lib/store';
import PricingPlans from 'components/PricingPlans';
import PricingFaq from 'components/PricingFaq';

export default function Billing() {
  const { user } = useAuth();
  const billingDetails = useStore((state) => state.billingDetails);
  const router = useRouter();

  const onSubscribe = useCallback(
    async (priceId: string | undefined, isSubscription: boolean) => {
      if (!priceId) {
        toast.error(`Price id ${priceId} is invalid.`);
        return;
      }

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
          priceId,
          isSubscription,
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

  const pricingButtons = useCallback(
    (showAnnual: boolean) => {
      const currentPlanId = billingDetails.planId;

      const switchPlanButton = (
        <button className="block w-full px-4 py-2 btn" onClick={onChangePlan}>
          Switch plan
        </button>
      );

      const proPlanPrices = PRICING_PLANS[PlanId.Pro].prices;
      const proSubscribeButton = (
        <button
          className="block w-full px-4 py-2 btn"
          onClick={() =>
            onSubscribe(
              showAnnual
                ? proPlanPrices.annual.priceId
                : proPlanPrices.monthly.priceId,
              true
            )
          }
        >
          Upgrade
        </button>
      );

      const catalystPlanPrices = PRICING_PLANS[PlanId.Catalyst].prices;
      const catalystSubscribeButton = (
        <button
          className="block w-full px-4 py-2 btn"
          onClick={() =>
            onSubscribe(
              catalystPlanPrices[BillingFrequency.OneTime].priceId,
              false
            )
          }
        >
          Upgrade
        </button>
      );

      const currentPlanBlock = (
        <div className="block w-full px-4 py-2 text-center text-gray-600 border rounded dark:text-gray-400">
          Current plan
        </div>
      );

      // Current plan is pro
      if (currentPlanId === PlanId.Pro) {
        return [switchPlanButton, currentPlanBlock, catalystSubscribeButton];
      }
      // Current plan is catalyst
      else if (currentPlanId === PlanId.Catalyst) {
        return [switchPlanButton, switchPlanButton, currentPlanBlock];
      }
      // Current plan is basic
      else {
        return [currentPlanBlock, proSubscribeButton, catalystSubscribeButton];
      }
    },
    [onSubscribe, billingDetails, onChangePlan]
  );

  return (
    <div className="flex-1 w-full h-full p-6 overflow-y-auto bg-white dark:bg-gray-800 dark:text-gray-100">
      <BillingBanner
        billingDetails={billingDetails}
        onChangePlan={onChangePlan}
      />
      <PricingPlans buttons={pricingButtons} />
      <PricingFaq className="py-12 sm:py-16" />
    </div>
  );
}

type BillingBannerProps = {
  billingDetails: BillingDetails;
  onChangePlan: () => void;
};

const BillingBanner = (props: BillingBannerProps) => {
  const { billingDetails, onChangePlan } = props;

  const planId = billingDetails.planId;
  const isSubscriptionPlan =
    planId !== PlanId.Basic &&
    billingDetails.frequency !== BillingFrequency.OneTime;
  const isCatalystPlan = planId === PlanId.Catalyst;
  const planName = PRICING_PLANS[planId].name;
  const frequencyText = isSubscriptionPlan
    ? `, billed ${
        billingDetails.frequency === BillingFrequency.Monthly
          ? 'monthly'
          : 'annually'
      }`
    : null;
  const currentPlanText = (
    <span>
      You are on the <span className="font-semibold">{planName} Plan</span>
      {frequencyText}.
    </span>
  );

  if (isSubscriptionPlan && billingDetails.cancelAtPeriodEnd) {
    // Subscription is cancelling at the end of the current period
    return (
      <div className="w-full pb-6 mb-6 space-y-2 border-b dark:border-gray-700">
        <p>
          {currentPlanText} Your subscription will be cancelled at the end of
          your billing period on{' '}
          {getReadableDate(billingDetails.currentPeriodEnd)}.
        </p>
        <p>
          To renew your plan,{' '}
          <button onClick={onChangePlan} className="link">
            click here
          </button>
          .
        </p>
      </div>
    );
  } else if (isSubscriptionPlan && !billingDetails.cancelAtPeriodEnd) {
    // Subscription is renewing at the end of the current period
    return (
      <div className="w-full pb-6 mb-6 space-y-2 border-b dark:border-gray-700">
        <p>
          {currentPlanText} Your subscription will renew on{' '}
          {getReadableDate(billingDetails.currentPeriodEnd)}.
        </p>
        <p>
          To edit your billing details,{' '}
          <button onClick={onChangePlan} className="link">
            click here
          </button>
          .
        </p>
      </div>
    );
  } else if (isCatalystPlan) {
    return (
      <div className="w-full pb-6 mb-6 space-y-2 border-b dark:border-gray-700">
        <p>
          {currentPlanText} Your 5 year plan will end on{' '}
          {getReadableDate(billingDetails.currentPeriodEnd)}.
        </p>
      </div>
    );
  } else {
    // No current subscription
    return (
      <p className="w-full pb-6 mb-6 border-b dark:border-gray-700">
        {currentPlanText} Upgrade to get unlimited notes.
      </p>
    );
  }
};

const getReadableDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
