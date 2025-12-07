import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { BillingFrequency, PlanId } from 'constants/pricing';
import { useAuth } from 'utils/useAuth';
import supabase from 'lib/supabase';
import { BillingDetails, useStore } from 'lib/store';

const isSubscriptionPlan = (
  billingDetails: BillingDetails
): billingDetails is Extract<
  BillingDetails,
  { frequency: BillingFrequency; cancelAtPeriodEnd: boolean }
> => {
  return 'frequency' in billingDetails && 'cancelAtPeriodEnd' in billingDetails;
};

export default function Account() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const billingDetails = useStore((state) => state.billingDetails);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpeningBillingPortal, setIsOpeningBillingPortal] = useState(false);

  const { hasSubscriptionPlan, requiresCancellation, cancellationDateText } =
    useMemo(() => {
      if (!isSubscriptionPlan(billingDetails)) {
        return {
          hasSubscriptionPlan: false,
          requiresCancellation: false,
          cancellationDateText: null,
        };
      }

      const hasSubscription =
        billingDetails.planId !== PlanId.Basic &&
        billingDetails.frequency !== BillingFrequency.OneTime;
      const needsCancellation =
        hasSubscription && !billingDetails.cancelAtPeriodEnd;

      const cancellationText =
        hasSubscription && billingDetails.cancelAtPeriodEnd
          ? `Your subscription will end on ${getReadableDate(
              billingDetails.currentPeriodEnd
            )}. Deleting your account now will remove access immediately.`
          : null;

      return {
        hasSubscriptionPlan: hasSubscription,
        requiresCancellation: needsCancellation,
        cancellationDateText: cancellationText,
      };
    }, [billingDetails]);

  const openBillingPortal = useCallback(async () => {
    if (!user) {
      toast.error('You need to be signed in to manage billing.');
      return;
    }

    setIsOpeningBillingPortal(true);
    const res = await fetch('/api/create-billing-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        redirectPath: router.asPath,
      }),
    });

    if (res.ok) {
      const { sessionUrl } = await res.json();
      window.location.href = sessionUrl;
    } else {
      toast.error('Error creating billing portal session');
      setIsOpeningBillingPortal(false);
    }
  }, [router.asPath, user]);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      toast.error('You need to be signed in to delete your account.');
      return;
    }

    if (requiresCancellation) {
      toast.error('Please cancel your subscription before deleting.');
      return;
    }

    const confirmed = window.confirm(
      'This will permanently delete your account and all of your notes. This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      toast.error(
        sessionError?.message ??
          'Unable to verify your session. Please sign in again.'
      );
      setIsDeleting(false);
      return;
    }

    const res = await fetch('/api/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });

    if (res.ok) {
      toast.success('Your account has been deleted.');
      await signOut();
    } else {
      const { message } = await res.json().catch(() => ({}));
      toast.error(
        message ?? 'Something went wrong deleting your account. Please retry.'
      );
      setIsDeleting(false);
    }
  }, [requiresCancellation, signOut, user]);

  return (
    <div className="h-full w-full flex-1 overflow-y-auto bg-white p-6 dark:bg-gray-800 dark:text-gray-100">
      <h1 className="mb-4 text-lg font-medium">Account</h1>

      <div className="rounded border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/30">
        <h2 className="text-base font-semibold text-red-700 dark:text-red-200">
          Delete account
        </h2>
        <p className="mt-2 text-sm text-red-800 dark:text-red-100">
          This action is permanent and will remove all of your notes. This
          cannot be undone.
        </p>
        {requiresCancellation ? (
          <p className="mt-3 text-sm font-medium text-red-800 dark:text-red-100">
            Cancel your subscription before deleting your account.
          </p>
        ) : null}
        {cancellationDateText ? (
          <p className="mt-3 text-sm text-red-800 dark:text-red-100">
            {cancellationDateText}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {hasSubscriptionPlan ? (
            <button
              className="btn-secondary px-4 py-2 text-sm font-medium"
              onClick={openBillingPortal}
              disabled={isOpeningBillingPortal || isDeleting}
            >
              {isOpeningBillingPortal ? 'Opening billing...' : 'Manage billing'}
            </button>
          ) : null}
          <button
            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition duration-200 hover:bg-red-700 disabled:opacity-50"
            onClick={deleteAccount}
            disabled={isDeleting || requiresCancellation}
          >
            {isDeleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  );
}

const getReadableDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
