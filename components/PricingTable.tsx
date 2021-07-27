import { Fragment, ReactNode, useCallback, useState, useMemo } from 'react';
import { IconCheck } from '@tabler/icons';
import { Plan, PlanId, PRICING_PLANS } from 'constants/pricing';
import Toggle from './Toggle';

const pricingTableData = [
  {
    name: 'Usage',
    data: [
      ['Notes', '50', 'Unlimited'],
      ['Image upload', '5 MB', '20 MB'],
    ],
  },
  {
    name: 'Features',
    data: [
      ['Rich-text editor', true, true],
      ['Backlinks', true, true],
      ['Sync between devices', true, true],
      ['Full-text search', true, true],
      ['Graph view', true, true],
      ['Import / export', true, true],
    ],
  },
  {
    name: 'Support',
    data: [
      ['Community support', true, true],
      ['Priority support', false, true],
    ],
  },
];

type Props = {
  buttons: ((showMonthly: boolean) => ReactNode)[];
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
        button: buttons[index](showMonthly),
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
        <span className="text-sm text-gray-600">Annual</span>
        <Toggle
          className="mx-2"
          isChecked={showMonthly}
          setIsChecked={setShowMonthly}
        />
        <span className="text-sm text-gray-600">Monthly</span>
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
                <span>${plan.billingPeriodPrice}</span>
                {isNotBasic ? (
                  <s className="ml-2 text-2xl text-gray-500">
                    {showMonthly ? '$10' : '$100'}
                  </s>
                ) : null}
                <span className="ml-1 text-2xl leading-8 text-gray-500">
                  {showMonthly ? '/ mo' : '/ yr'}
                </span>
              </div>
            </div>
            {isNotBasic ? (
              <div className="pb-2 text-gray-500">
                {!showMonthly ? (
                  <span className="text-sm">
                    Billed yearly (${plan.monthlyPrice} / mo)
                  </span>
                ) : (
                  <span className="text-sm">
                    Billed monthly (${plan.annualPrice} / yr)
                  </span>
                )}
              </div>
            ) : null}
            <div className="py-2">{plan.button}</div>
            <table className="w-full">
              {pricingTableData.map((category) => (
                <Fragment key={`${category.name}-container`}>
                  <tr className="border-b" key={`${category.name}-title`}>
                    <td className="pt-4 pb-2 font-semibold">{category.name}</td>
                  </tr>
                  {category.data.map((row, rowIndex) => (
                    <tr
                      className="border-b"
                      key={`${category.name}-${rowIndex}`}
                    >
                      {row.map((datum, datumIndex) =>
                        datumIndex === 0 || datumIndex === planIndex + 1 ? (
                          <td
                            key={`${category.name}-${rowIndex}-${datumIndex}`}
                            className="py-2"
                          >
                            {typeof datum === 'boolean' && datum ? (
                              <IconCheck className="text-primary-500" />
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
          <th className="py-2 w-52 md:w-1/3">{PRICING_PLANS.basic.name}</th>
          <th className="py-2 w-52 md:w-1/3">
            <span>{PRICING_PLANS.pro.name}</span>
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
                <span>${plan.billingPeriodPrice}</span>
                {plan.id !== PlanId.Basic ? (
                  <s className="ml-2 text-2xl text-gray-500">
                    {showMonthly ? '$10' : '$100'}
                  </s>
                ) : null}
                <span className="ml-1 text-2xl leading-8 text-gray-500">
                  {showMonthly ? '/ mo' : '/ yr'}
                </span>
              </div>
            </td>
          ))}
        </tr>
        <tr>
          <td className="pb-2"></td>
          {plans.map((plan) => (
            <td key={plan.id} className="pb-2 text-gray-500">
              {plan.id !== PlanId.Basic ? (
                !showMonthly ? (
                  <span className="text-sm">
                    Billed yearly (${plan.monthlyPrice} / mo)
                  </span>
                ) : (
                  <span className="text-sm">
                    Billed monthly (${plan.annualPrice} / yr)
                  </span>
                )
              ) : null}
            </td>
          ))}
        </tr>
        <tr>
          <td className="py-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Annual</span>
              <Toggle
                className="mx-2"
                isChecked={showMonthly}
                setIsChecked={setShowMonthly}
              />
              <span className="text-sm text-gray-600">Monthly</span>
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
            <tr className="border-b" key={`${category.name}-title`}>
              <td className="pt-4 pb-2 font-semibold">{category.name}</td>
            </tr>
            {category.data.map((row, rowIndex) => (
              <tr className="border-b" key={`${category.name}-${rowIndex}`}>
                {row.map((datum, datumIndex) => (
                  <td
                    key={`${category.name}-${rowIndex}-${datumIndex}`}
                    className="py-2"
                  >
                    {typeof datum === 'boolean' && datum ? (
                      <IconCheck className="text-primary-500" />
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
