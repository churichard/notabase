import { Fragment, ReactNode, useCallback, useState } from 'react';
import { IconCheck } from '@tabler/icons';
import { Plan, plans } from 'constants/pricing';
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

  return (
    <>
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
        <div>
          <div className="py-2 text-xl font-semibold">{plans.basic.name}</div>
          <div className="py-2">
            <div className="flex items-baseline text-4xl font-semibold">
              <span>${getBillingPeriodPrice(plans.basic)}</span>
              <span className="ml-1 text-2xl leading-8 text-gray-500">
                {showMonthly ? '/ mo' : '/ yr'}
              </span>
            </div>
          </div>
          <div className="py-2">{buttons[0](showMonthly)}</div>
          <table className="w-full">
            {pricingTableData.map((category) => (
              <Fragment key={`${category.name}-container`}>
                <tr className="border-b" key={`${category.name}-title`}>
                  <td className="pt-4 pb-2 font-semibold">{category.name}</td>
                </tr>
                {category.data.map((row, rowIndex) => (
                  <tr className="border-b" key={`${category.name}-${rowIndex}`}>
                    {row.map((datum, datumIndex) =>
                      datumIndex === 0 || datumIndex === 1 ? (
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
        <div>
          <div className="flex items-center py-2 text-xl font-semibold">
            <span>{plans.pro.name}</span>
            <span className="px-2 py-1 ml-2 text-xs font-medium rounded-full text-primary-900 bg-primary-100">
              Early bird pricing
            </span>
          </div>
          <div className="py-2">
            <div className="flex items-baseline text-4xl font-semibold">
              <span>${getBillingPeriodPrice(plans.pro)}</span>
              <s className="ml-2 text-2xl text-gray-500">
                {showMonthly ? '$10' : '$100'}
              </s>
              <span className="ml-1 text-2xl leading-8 text-gray-500">
                {showMonthly ? '/ mo' : '/ yr'}
              </span>
            </div>
          </div>
          <div className="pb-2 text-gray-500">
            {!showMonthly ? (
              <span className="text-sm">
                ${getMonthlyPrice(plans.pro)} / mo
              </span>
            ) : (
              <span className="text-sm">${getAnnualPrice(plans.pro)} / yr</span>
            )}
          </div>
          <div className="py-2">{buttons[1](showMonthly)}</div>
          <table className="w-full">
            {pricingTableData.map((category) => (
              <Fragment key={`${category.name}-container`}>
                <tr className="border-b" key={`${category.name}-title`}>
                  <td className="pt-4 pb-2 font-semibold">{category.name}</td>
                </tr>
                {category.data.map((row, rowIndex) => (
                  <tr className="border-b" key={`${category.name}-${rowIndex}`}>
                    {row.map((datum, datumIndex) =>
                      datumIndex === 0 || datumIndex === 2 ? (
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
      </div>
      <table className="hidden w-full table-fixed md:table">
        <thead className="text-left">
          <tr>
            <th className="py-2 w-52 md:w-1/3"></th>
            <th className="py-2 w-52 md:w-1/3">{plans.basic.name}</th>
            <th className="py-2 w-52 md:w-1/3">
              <span>{plans.pro.name}</span>
              <span className="px-2 py-1 ml-2 text-xs font-medium rounded-full text-primary-900 bg-primary-100">
                Early bird pricing
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2"></td>
            <td className="py-2">
              <div className="flex items-baseline text-4xl font-semibold">
                <span>${getBillingPeriodPrice(plans.basic)}</span>
                <span className="ml-1 text-2xl leading-8 text-gray-500">
                  {showMonthly ? '/ mo' : '/ yr'}
                </span>
              </div>
            </td>
            <td className="py-2">
              <div className="flex items-baseline text-4xl font-semibold">
                <span>${getBillingPeriodPrice(plans.pro)}</span>
                <s className="ml-2 text-2xl text-gray-500">
                  {showMonthly ? '$10' : '$100'}
                </s>
                <span className="ml-1 text-2xl leading-8 text-gray-500">
                  {showMonthly ? '/ mo' : '/ yr'}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="pb-2"></td>
            <td className="pb-2"></td>
            <td className="pb-2 text-gray-500">
              {!showMonthly ? (
                <span className="text-sm">
                  ${getMonthlyPrice(plans.pro)} / mo
                </span>
              ) : (
                <span className="text-sm">
                  ${getAnnualPrice(plans.pro)} / yr
                </span>
              )}
            </td>
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
            {buttons.map((button, index) => (
              <td key={index} className="py-2 pr-6">
                {button(showMonthly)}
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
    </>
  );
}
