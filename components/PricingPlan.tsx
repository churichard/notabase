import { ReactNode } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { IconCheck } from '@tabler/icons';

type Props = {
  name: string;
  price: number;
  period: string;
  bulletPoints: string[];
  discount?: string;
  button?: ReactNode;
  className?: string;
};

const PricingPlan = (props: Props) => {
  const { name, price, period, discount, bulletPoints, button, className } =
    props;

  const pricingPlanClassName = classNames(
    'flex flex-col rounded-lg border overflow-hidden shadow-md',
    className
  );

  return (
    <div className={pricingPlanClassName}>
      <div className="flex justify-between p-6 sm:p-10 sm:pb-6">
        <div>
          <div>
            <span className="inline-flex rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold uppercase leading-5 tracking-wide text-primary-900 dark:bg-primary-900 dark:text-primary-100">
              {name}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-baseline leading-none">
            <span className="text-5xl font-extrabold lg:text-6xl">
              ${price}
            </span>
            {discount ? (
              <span className="px-1 text-2xl text-gray-500 line-through lg:text-3xl">
                ${discount}
              </span>
            ) : null}
            <span className="ml-1 text-xl font-medium leading-8 text-gray-500 lg:text-2xl">
              {period}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-10 sm:pt-6">
        <ul className="flex-1 space-y-4">
          {bulletPoints.map((bulletPoint, index) => (
            <li key={index} className="flex items-start">
              <IconCheck className="flex-shrink-0 text-green-500" />
              <p className="ml-3 leading-6 text-gray-700 dark:text-gray-200">
                {bulletPoint}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          {button ?? (
            <Link
              href="/signup"
              className="btn block w-full px-4 py-2 text-center"
            >
              Get started for free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingPlan;
