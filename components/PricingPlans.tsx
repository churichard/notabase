import { useState } from 'react';
import {
  MAX_NUM_OF_BASIC_NOTES,
  PlanId,
  PRICING_PLANS,
} from 'constants/pricing';
import PricingPlan from './PricingPlan';
import Toggle from './Toggle';
import PricingFaq from './PricingFaq';

const BASIC_BULLET_POINTS = [
  `${MAX_NUM_OF_BASIC_NOTES} notes`,
  '5 MB image upload',
  'Community support',
];

const PRO_BULLET_POINTS = [
  'Everything in Basic, plus:',
  'Unlimited notes',
  '20 MB image upload',
  'Publishing to the web (coming soon)',
  'Community and email support',
];

export default function PricingPlans() {
  const [showAnnual, setShowAnnual] = useState(true);

  return (
    <div>
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
          <span className="px-2 py-1 ml-1 font-semibold rounded-full text-primary-900 bg-primary-100">
            2 months free!
          </span>
        </span>
      </div>
      <div className="grid max-w-4xl gap-4 mx-auto gap md:grid-cols-2">
        <PricingPlan
          plan={PRICING_PLANS[PlanId.Basic]}
          showAnnual={showAnnual}
          bulletPoints={BASIC_BULLET_POINTS}
        />
        <PricingPlan
          plan={PRICING_PLANS[PlanId.Pro]}
          showAnnual={showAnnual}
          bulletPoints={PRO_BULLET_POINTS}
        />
      </div>
      <PricingFaq />
    </div>
  );
}
