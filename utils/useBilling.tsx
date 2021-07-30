import type { ReactNode } from 'react';
import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { PlanId } from 'constants/pricing';
import supabase from 'lib/supabase';
import { Subscription, SubscriptionStatus } from 'types/supabase';
import { useAuth } from './useAuth';

export type SubscriptionContextType = {
  planId: PlanId;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
};

type BillingContextType = {
  subscription: SubscriptionContextType | null;
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
        'plan_id, subscription_status, current_period_end, cancel_at_period_end'
      )
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSubscription({
        planId: data.plan_id,
        subscriptionStatus: data.subscription_status,
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

  return {
    isLoaded,
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
