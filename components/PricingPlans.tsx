import { ReactNode, useCallback, useState } from 'react';
import {
  BillingFrequency,
  isSubscription,
  MAX_NUM_OF_BASIC_NOTES,
  PlanId,
  PRICING_PLANS,
} from 'constants/pricing';
import PricingPlan from './PricingPlan';
import Toggle from './Toggle';

const BASIC_BULLET_POINTS = [
  'Try it out for free',
  `${MAX_NUM_OF_BASIC_NOTES} notes`,
  '5 MB image uploads',
  'Community support',
];

const PRO_BULLET_POINTS = [
  'Everything in Basic, plus:',
  'Unlimited notes',
  '20 MB image uploads',
  'Publishing to the web (coming soon)',
  'Community and email support',
];

const CATALYST_BULLET_POINTS = [
  'Everything in Pro, plus:',
  'One-time payment for 5 years of access',
  "Support Notabase's development",
  'Early access to new features',
  'Exclusive Discord role',
];

type Props = {
  buttons?: (showAnnual: boolean) => ReactNode[];
};

export default function PricingPlans(props: Props) {
  const { buttons } = props;
  const [showAnnual, setShowAnnual] = useState(true);

  const getBillingPeriodPrice = useCallback(
    (planId: PlanId, showAnnual: boolean) => {
      const plan = PRICING_PLANS[planId];
      let price;
      if (isSubscription(plan.prices)) {
        price = showAnnual
          ? plan.prices[BillingFrequency.Annual]
          : plan.prices[BillingFrequency.Monthly];
      } else {
        price = plan.prices[BillingFrequency.OneTime];
      }
      return +(price.amount / 100).toFixed(2);
    },
    []
  );

  return (
    <>
      <div className="flex items-center justify-center py-8 md:py-10">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Monthly
        </span>
        <Toggle
          className="mx-2"
          isChecked={showAnnual}
          setIsChecked={setShowAnnual}
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Annual{' '}
          <span className="px-3 py-1 ml-1 font-semibold rounded-full text-primary-900 bg-primary-100 whitespace-nowrap dark:bg-primary-900 dark:text-primary-100">
            2 months free!
          </span>
        </span>
      </div>
      <div className="grid gap-4 mx-auto lg:grid-cols-3">
        <PricingPlan
          className="w-full mx-auto md:w-96 lg:w-full"
          name={PRICING_PLANS[PlanId.Basic].name}
          price={getBillingPeriodPrice(PlanId.Basic, showAnnual)}
          period={showAnnual ? '/ yr' : '/ mo'}
          bulletPoints={BASIC_BULLET_POINTS}
          button={buttons?.(showAnnual)[0]}
        />
        <PricingPlan
          className="w-full mx-auto md:w-96 lg:w-full"
          name={PRICING_PLANS[PlanId.Pro].name}
          price={getBillingPeriodPrice(PlanId.Pro, showAnnual)}
          period={showAnnual ? '/ yr' : '/ mo'}
          bulletPoints={PRO_BULLET_POINTS}
          button={buttons?.(showAnnual)[1]}
        />
        <PricingPlan
          className="w-full mx-auto md:w-96 lg:w-full"
          name={PRICING_PLANS[PlanId.Catalyst].name}
          price={getBillingPeriodPrice(PlanId.Catalyst, showAnnual)}
          period="/ 5 yrs"
          bulletPoints={CATALYST_BULLET_POINTS}
          button={buttons?.(showAnnual)[2]}
        />
      </div>
    </>
  );
}
