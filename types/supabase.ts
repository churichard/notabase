import type { Descendant } from 'slate';
import type { PlanId } from 'constants/pricing';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export type User = {
  id: string;
  billing_data: {
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: SubscriptionStatus | null;
    plan_id: PlanId | null;
  };
};

export type Note = {
  id: string;
  user_id: User['id'];
  content: Descendant[];
  title: string;
  created_at: string;
  updated_at: string;
};
