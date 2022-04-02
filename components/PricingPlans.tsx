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
      <div className="grid max-w-4xl gap-4 mx-auto md:grid-cols-2">
        <PricingPlan
          className="w-full mx-auto lg:w-full"
          name={PRICING_PLANS[PlanId.Basic].name}
          price={getBillingPeriodPrice(PlanId.Basic, showAnnual)}
          period={showAnnual ? '/ yr' : '/ mo'}
          bulletPoints={BASIC_BULLET_POINTS}
          button={buttons?.(showAnnual)[0]}
        />
        <PricingPlan
          className="w-full mx-auto lg:w-full"
          name={PRICING_PLANS[PlanId.Pro].name}
          price={getBillingPeriodPrice(PlanId.Pro, showAnnual)}
          period={showAnnual ? '/ yr' : '/ mo'}
          bulletPoints={PRO_BULLET_POINTS}
          button={buttons?.(showAnnual)[1]}
        />
      </div>
    </>
  );
}
