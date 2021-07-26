import { ReactNode, useCallback, useState } from 'react';
import { IconCheck } from '@tabler/icons';
import { Plan, plans } from 'constants/pricing';
import Toggle from './Toggle';

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
    <table className="w-full text-left table-fixed">
      <thead>
        <tr>
          <th className="w-48 py-2 md:w-1/3"></th>
          <th className="w-48 py-2 md:w-1/3">{plans.basic.name}</th>
          <th className="w-48 py-2 md:w-1/3">
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
                {showMonthly ? '/ month' : '/ year'}
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
                {showMonthly ? '/ month' : '/ year'}
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
                ${getMonthlyPrice(plans.pro)} / month
              </span>
            ) : (
              <span className="text-sm">
                ${getAnnualPrice(plans.pro)} / year
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
        <tr>
          <td className="pt-4 pb-2 font-semibold border-b">Usage</td>
          <td className="py-2 font-semibold border-b"></td>
          <td className="py-2 font-semibold border-b"></td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Notes</td>
          <td className="py-2 border-b">50</td>
          <td className="py-2 border-b">Unlimited</td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Image upload</td>
          <td className="py-2 border-b">5 MB</td>
          <td className="py-2 border-b">10 MB</td>
        </tr>
        <tr>
          <td className="pt-4 pb-2 font-semibold border-b">Features</td>
          <td className="py-2 font-semibold border-b"></td>
          <td className="py-2 font-semibold border-b"></td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Rich-text editor</td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Backlinks</td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Sync between devices</td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Graph view</td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Full-text search</td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Import / export</td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
        </tr>
        <tr>
          <td className="pt-4 pb-2 font-semibold border-b">Support</td>
          <td className="py-2 font-semibold border-b"></td>
          <td className="py-2 font-semibold border-b"></td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Community support</td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
        </tr>
        <tr>
          <td className="py-2 text-gray-600 border-b">Priority support</td>
          <td className="py-2 border-b"></td>
          <td className="py-2 border-b">
            <IconCheck className="text-primary-500" />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
