import type { ReactNode } from 'react';
import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react';
import type { User } from '@supabase/supabase-js';
import {
  PlanId,
  BillingFrequency,
  Feature,
  PRICING_PLANS,
} from 'constants/pricing';
import supabase from 'lib/supabase';
import { Subscription, SubscriptionStatus } from 'types/supabase';
import { useAuth } from './useAuth';

export type SubscriptionContextType = {
  planId: PlanId;
  frequency: BillingFrequency;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
};

type BillingContextType = {
  subscription: SubscriptionContextType | null;
  canUseFeature: (feature: Feature) => boolean;
  isLoaded: boolean;
};

const BillingContext = createContext<BillingContextType | undefined>(undefined);

function useProvideBilling(): BillingContextType {
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const [subscription, setSubscription] =
    useState<SubscriptionContextType | null>(null);

  // Get the subscription based on the user
  const initSubscription = useCallback(async (user: User) => {
    const { data } = await supabase
      .from<Subscription>('subscriptions')
      .select(
        'plan_id, subscription_status, frequency, current_period_end, cancel_at_period_end'
      )
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSubscription({
        planId:
          data.subscription_status === SubscriptionStatus.Active
            ? data.plan_id
            : PlanId.Basic,
        frequency: data.frequency,
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end,
      });
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    initSubscription(user);
  }, [initSubscription, user]);

  const canUseFeature = useCallback(
    (feature: Feature) => {
      return (
        (subscription &&
          PRICING_PLANS[subscription.planId].features.includes(feature)) ??
        false
      );
    },
    [subscription]
  );

  return {
    isLoaded,
    canUseFeature,
    subscription,
  };
}

export function ProvideBilling({ children }: { children: ReactNode }) {
  const billing = useProvideBilling();
  return (
    <BillingContext.Provider value={billing}>
      {children}
    </BillingContext.Provider>
  );
}

// Hook for child components to get the billing object and re-render when it changes.
export const useBilling = () => {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a provider');
  }
  return context;
};
