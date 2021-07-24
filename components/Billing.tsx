import { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js/pure';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { IconCheck } from '@tabler/icons';
import { Plan, plans } from 'constants/pricing';
import Toggle from './Toggle';

export default function Billing() {
  const [showMonthly, setShowMonthly] = useState(false);
  const router = useRouter();

  const onSubscribe = useCallback(
    async (plan: Plan) => {
      // Create stripe checkout session
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectPath: router.asPath,
          priceId: showMonthly
            ? plan.prices.monthly.priceId
            : plan.prices.annual.priceId,
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
    [router, showMonthly]
  );

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

  const getBillingPeriodPrice = useCallback(
    (plan: Plan) => {
      const price = showMonthly ? plan.prices.monthly : plan.prices.annual;
      return +(price.amount / 100).toFixed(2);
    },
    [showMonthly]
  );

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <table className="w-full text-left table-fixed">
        <thead>
          <tr>
            <th className="w-48 py-2 md:w-1/3"></th>
            <th className="w-48 py-2 md:w-1/3">{plans.basic.name}</th>
            <th className="w-48 py-2 md:w-1/3">{plans.pro.name}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2"></td>
            <td className="py-2">
              <div className="flex items-baseline text-4xl font-semibold">
                <span>${getBillingPeriodPrice(plans.basic)}</span>
                <span className="ml-1 text-2xl leading-8 text-gray-500">
                  {showMonthly ? '/mo' : '/yr'}
                </span>
              </div>
            </td>
            <td className="py-2">
              <div className="flex items-baseline text-4xl font-semibold">
                <span>${getBillingPeriodPrice(plans.pro)}</span>
                <span className="ml-1 text-2xl leading-8 text-gray-500">
                  {showMonthly ? '/mo' : '/yr'}
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
                  ${getMonthlyPrice(plans.pro)} / mo &mdash;{' '}
                  {plans.pro.prices.annual.discount}
                </span>
              ) : (
                <span className="text-sm">Billed monthly. Cancel anytime.</span>
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
            <td className="py-2 pr-6">
              <div className="w-full px-4 py-2 text-center text-gray-600 border rounded">
                Current plan
              </div>
            </td>
            <td className="py-2 pr-6">
              <button
                className="w-full px-4 py-2 btn"
                onClick={() => onSubscribe(plans.pro)}
              >
                Upgrade
              </button>
            </td>
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
            <td className="py-2 text-gray-600 border-b">
              Sync between devices
            </td>
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
    </div>
  );
}
