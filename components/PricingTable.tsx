import { Fragment, ReactNode, useCallback, useState, useMemo } from 'react';
import { IconCheck, IconMinus } from '@tabler/icons';
import {
  MAX_NUM_OF_BASIC_NOTES,
  Plan,
  PlanId,
  PRICING_PLANS,
} from 'constants/pricing';
import Toggle from './Toggle';

const pricingTableData = [
  {
    name: 'Usage',
    data: [
      ['Notes', MAX_NUM_OF_BASIC_NOTES, 'Unlimited'],
      ['Image upload', '5 MB', '20 MB'],
    ],
  },
  {
    name: 'Features',
    data: [
      ['Powerful rich-text editor', true, true],
      ['Backlinks', true, true],
      ['Sync between devices', true, true],
      ['Full-text search', true, true],
      ['Graph view', true, true],
      ['Import / export', true, true],
      ['Block references', true, true],
      ['Offline viewing', true, true],
      ['Publishing to the web (coming soon)', false, true],
    ],
  },
  {
    name: 'Support',
    data: [
      ['Community support', true, true],
      ['Email support', false, true],
    ],
  },
];

type Props = {
  buttons: (showMonthly: boolean) => ReactNode[];
};

export default function PricingTable(props: Props) {
  const { buttons } = props;
  const [showMonthly, setShowMonthly] = useState(false);

  const getMonthlyPrice = useCallback(
    (plan: Plan) => {
      const prices = plan.prices;
      const price = showMonthly
        ? prices.monthly.amount / 100
        : prices.annual.amount / 100 / 12;
      return +price.toFixed(2);
    },
    [showMonthly]
  );

  const getAnnualPrice = useCallback(
    (plan: Plan) => {
      const prices = plan.prices;
      const price = showMonthly
        ? (prices.monthly.amount / 100) * 12
        : prices.annual.amount / 100;
      return +price.toFixed(2);
    },
    [showMonthly]
  );

  const getBillingPeriodPrice = useCallback(
    (plan: Plan) => {
      const price = showMonthly ? plan.prices.monthly : plan.prices.annual;
      return +(price.amount / 100).toFixed(2);
    },
    [showMonthly]
  );

  const plans = useMemo(
    () =>
      Object.values(PRICING_PLANS).map((plan, index) => ({
        id: plan.id,
        name: plan.name,
        billingPeriodPrice: getBillingPeriodPrice(plan),
        monthlyPrice: getMonthlyPrice(plan),
        annualPrice: getAnnualPrice(plan),
        button: buttons(showMonthly)[index],
      })),
    [
      getBillingPeriodPrice,
      getMonthlyPrice,
      getAnnualPrice,
      buttons,
      showMonthly,
    ]
  );

  return (
    <>
      <MobilePricingTable
        plans={plans}
        showMonthly={showMonthly}
        setShowMonthly={setShowMonthly}
      />
      <DesktopPricingTable
        plans={plans}
        showMonthly={showMonthly}
        setShowMonthly={setShowMonthly}
      />
      <Faq />
    </>
  );
}

type MobilePricingTableProps = {
  plans: {
    id: PlanId;
    name: string;
    billingPeriodPrice: number;
    monthlyPrice: number;
    annualPrice: number;
    button: ReactNode;
  }[];
  showMonthly: boolean;
  setShowMonthly: (showMonthly: boolean) => void;
};

const MobilePricingTable = (props: MobilePricingTableProps) => {
  const { plans, showMonthly, setShowMonthly } = props;
  return (
    <div className="w-full space-y-8 md:hidden">
      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-600 dark:text-gray-300">Annual</span>
        <Toggle
          className="mx-2"
          isChecked={showMonthly}
          setIsChecked={setShowMonthly}
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Monthly
        </span>
      </div>
      {plans.map((plan, planIndex) => {
        const isNotBasic = plan.id !== PlanId.Basic;
        return (
          <div key={plan.id}>
            <div className="flex items-center py-2 text-xl font-semibold">
              <span>{plan.name}</span>
              {isNotBasic ? (
                <span className="px-2 py-1 ml-2 text-xs font-medium rounded-full text-primary-900 bg-primary-100">
                  Early bird pricing
                </span>
              ) : null}
            </div>
            <div className="py-2">
              <div className="flex items-baseline text-4xl font-semibold">
                <span>${plan.monthlyPrice}</span>
                {isNotBasic ? (
                  <s className="ml-2 text-2xl text-gray-500 dark:text-gray-400">
                    {showMonthly ? '$10' : '$8.33'}
                  </s>
                ) : null}
                <span className="ml-1 text-2xl text-gray-500 whitespace-nowrap dark:text-gray-400">
                  / mo
                </span>
              </div>
            </div>
            {isNotBasic ? (
              <div className="pb-2 text-gray-500 dark:text-gray-400">
                {!showMonthly ? (
                  <span className="text-sm">
                    Billed yearly (${plan.annualPrice} / yr)
                  </span>
                ) : (
                  <span className="text-sm">Billed monthly</span>
                )}
              </div>
            ) : null}
            <div className="py-2">{plan.button}</div>
            <table className="w-full">
              <tbody>
                {pricingTableData.map((category) => (
                  <Fragment key={`${category.name}-container`}>
                    <tr
                      className="border-b dark:border-gray-700"
                      key={`${category.name}-title`}
                    >
                      <td className="pt-4 pb-2 font-semibold">
                        {category.name}
                      </td>
                    </tr>
                    {category.data.map((row, rowIndex) => (
                      <tr
                        className="border-b dark:border-gray-700"
                        key={`${category.name}-${rowIndex}`}
                      >
                        {row.map((datum, datumIndex) =>
                          datumIndex === 0 || datumIndex === planIndex + 1 ? (
                            <td
                              key={`${category.name}-${rowIndex}-${datumIndex}`}
                              className={`py-2 ${
                                datumIndex !== 0 ? 'text-right' : ''
                              }`}
                            >
                              {typeof datum === 'boolean' ? (
                                datum ? (
                                  <IconCheck className="ml-auto mr-0 text-primary-500" />
                                ) : (
                                  <IconMinus className="ml-auto mr-0 text-gray-400" />
                                )
                              ) : (
                                datum
                              )}
                            </td>
                          ) : null
                        )}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

type DesktopPricingTableProps = {
  plans: {
    id: PlanId;
    name: string;
    billingPeriodPrice: number;
    monthlyPrice: number;
    annualPrice: number;
    button: ReactNode;
  }[];
  showMonthly: boolean;
  setShowMonthly: (showMonthly: boolean) => void;
};

const DesktopPricingTable = (props: DesktopPricingTableProps) => {
  const { plans, showMonthly, setShowMonthly } = props;
  return (
    <table className="hidden w-full table-fixed md:table">
      <thead className="text-left">
        <tr>
          <th className="py-2 w-52 md:w-1/3"></th>
          <th className="py-2 text-lg w-52 md:w-1/3">
            {PRICING_PLANS.basic.name}
          </th>
          <th className="py-2 w-52 md:w-1/3">
            <span className="text-lg">{PRICING_PLANS.pro.name}</span>
            <span className="px-2 py-1 ml-2 text-xs font-medium rounded-full text-primary-900 bg-primary-100">
              Early bird pricing
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-2"></td>
          {plans.map((plan) => (
            <td key={plan.id} className="py-2">
              <div className="flex items-baseline text-4xl font-semibold">
                <span>${plan.monthlyPrice}</span>
                {plan.id !== PlanId.Basic ? (
                  <s className="ml-2 text-2xl text-gray-500 dark:text-gray-400">
                    {showMonthly ? '$10' : '$8.33'}
                  </s>
                ) : null}
                <span className="ml-1 text-2xl text-gray-500 whitespace-nowrap dark:text-gray-400">
                  / mo
                </span>
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="pb-2"></td>
          {plans.map((plan) => (
            <td key={plan.id} className="pb-2 text-gray-500 dark:text-gray-400">
              {plan.id !== PlanId.Basic ? (
                !showMonthly ? (
                  <span className="text-sm">
                    Billed yearly (${plan.annualPrice} / yr)
                  </span>
                ) : (
                  <span className="text-sm">Billed monthly</span>
                )
              ) : null}
            </td>
          ))}
        </tr>
        <tr>
          <td className="py-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Annual
              </span>
              <Toggle
                className="mx-2"
                isChecked={showMonthly}
                setIsChecked={setShowMonthly}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Monthly
              </span>
            </div>
          </td>
          {plans.map((plan) => (
            <td key={plan.id} className="py-2 pr-6">
              {plan.button}
            </td>
          ))}
        </tr>
        {pricingTableData.map((category) => (
          <Fragment key={`${category.name}-container`}>
            <tr
              className="border-b dark:border-gray-700"
              key={`${category.name}-title`}
            >
              <td className="pt-4 pb-2 font-semibold">{category.name}</td>
            </tr>
            {category.data.map((row, rowIndex) => (
              <tr
                className="border-b dark:border-gray-700"
                key={`${category.name}-${rowIndex}`}
              >
                {row.map((datum, datumIndex) => (
                  <td
                    key={`${category.name}-${rowIndex}-${datumIndex}`}
                    className="py-2"
                  >
                    {typeof datum === 'boolean' ? (
                      datum ? (
                        <IconCheck className="text-primary-500 dark:text-primary-400" />
                      ) : (
                        <IconMinus className="text-gray-400 dark:text-gray-200" />
                      )
                    ) : (
                      datum
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
};

const Faq = () => {
  return (
    <div className="py-12 sm:py-16 lg:py-24">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
        FAQ
      </h2>
      <div className="pt-10 mt-6 border-t dark:border-gray-700">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Can I try Notabase for free?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                Yes, just sign up with the Basic plan and you can try out
                Notabase for free for an unlimited amount of time.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Do I need a credit card to sign up?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                You can sign up for Notabase and use the Basic plan without a
                credit card.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Can I cancel at any time?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can cancel your subscription at any time. You&apos;ll
                continue to have access for the remainder of your billing
                period.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              What happens if I switch between the monthly and annual plans?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                You&apos;ll receive a prorated credit for the time remaining on
                your current plan and be billed for the new plan.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              What is &ldquo;early bird pricing&rdquo;?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                Notabase is in beta. If you subscribe now, you&apos;ll get a 30%
                lifetime discount as a token of our appreciation. You&apos;ll be
                locked in at this lower price as long as your subscription
                remains active.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              What if I still have questions?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                Feel free to{' '}
                <a
                  href="mailto:hello@notabase.io"
                  className="link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  email us
                </a>{' '}
                and we&apos;ll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
