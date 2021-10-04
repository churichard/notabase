import { MAX_NUM_OF_BASIC_NOTES } from 'constants/pricing';

type Props = {
  className?: string;
};

export default function PricingFaq(props: Props) {
  const { className } = props;
  return (
    <div className={className}>
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
              How do I subscribe?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                Sign up for an account and log in. Click on
                &ldquo;Notabase&rdquo; in the sidebar, then &ldquo;Settings &
                Billing&rdquo;. From there, select &ldquo;Billing&rdquo; in the
                sidebar and click &ldquo;Upgrade&rdquo; underneath the Pro plan.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Can I get a discount?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                If you subscribe now, you&apos;ll get a lifetime discount on the
                full price. You&apos;ll be locked in at this lower price as long
                as your subscription remains active. Prices will go up soon, so
                act fast.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              What happens if I reach {MAX_NUM_OF_BASIC_NOTES} notes on the
              Basic plan?
            </h3>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">
                Once you reach {MAX_NUM_OF_BASIC_NOTES} notes on the Basic plan,
                you won&apos;t be able to create any more notes and will be
                asked to upgrade. You will still be able to browse your notes,
                export them, and use all functionality that doesn&apos;t involve
                creating notes.
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
}
