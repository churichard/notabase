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

type SubscriptionContextType = {
  planId: PlanId;
  subscriptionStatus: SubscriptionStatus;
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
    // TODO: uncomment this when table is created
    // const { data } = await supabase
    //   .from<Subscription>('subscriptions')
    //   .select('plan_id, subscription_status')
    //   .eq('user_id', user.id)
    //   .maybeSingle();

    // if (data) {
    //   setSubscription({
    //     planId: data.plan_id,
    //     subscriptionStatus: data.subscription_status,
    //   });
    // }

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
