import { useMemo } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { IconCheck } from '@tabler/icons';
import { Plan, PlanId } from 'constants/pricing';

type Props = {
  plan: Plan;
  bulletPoints: string[];
  showAnnual: boolean;
  className?: string;
};

const PricingPlan = (props: Props) => {
  const { plan, showAnnual, bulletPoints, className } = props;

  const pricingPlanClassName = classNames(
    'flex flex-col rounded-lg border overflow-hidden shadow-md',
    className
  );

  const getBillingPeriodPrice = useMemo(() => {
    const price = showAnnual ? plan.prices.annual : plan.prices.monthly;
    return +(price.amount / 100).toFixed(2);
  }, [showAnnual, plan]);

  return (
    <div className={pricingPlanClassName}>
      <div className="flex justify-between p-6 bg-white sm:p-10 sm:pb-6">
        <div>
          <div>
            <span className="inline-flex px-4 py-1 text-sm font-semibold leading-5 tracking-wide uppercase rounded-full text-primary-600 bg-primary-100">
              {plan.name}
            </span>
          </div>
          <div className="flex items-baseline mt-4 leading-none">
            <span className="text-6xl font-extrabold">
              ${getBillingPeriodPrice}
            </span>
            {/* TODO: this is temporary for early bird pricing */}
            {plan.id !== PlanId.Basic ? (
              <span className="px-1 text-3xl text-gray-500 line-through">
                ${showAnnual ? '108' : '12'}
              </span>
            ) : null}
            <span className="ml-1 text-2xl font-medium leading-8 text-gray-500">
              {showAnnual ? '/yr' : '/mo'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-6 bg-white sm:p-10 sm:pt-6">
        <ul className="flex-1 space-y-4">
          {bulletPoints.map((bulletPoint, index) => (
            <li key={index} className="flex items-start">
              <IconCheck className="flex-shrink-0 text-green-500" />
              <p className="ml-3 leading-6 text-gray-700">{bulletPoint}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link href="/signup">
            <a className="block w-full px-4 py-2 text-center btn">
              Get started for free
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPlan;
