const isDev = process.env.NODE_ENV === 'development';

const PRO_DEV_PRODUCT_ID = 'prod_JuH32Q7obJDLdu';
const PRO_MONTHLY_DEV_PRICE_ID = 'price_1JGSVLCXZdSttUYj13lhWEzJ';
const PRO_ANNUAL_DEV_PRICE_ID = 'price_1JGSVLCXZdSttUYj2LUZT3T5';

const PRO_PROD_PRODUCT_ID = 'prod_JuGvuo7cLr1UF7';
const PRO_MONTHLY_PROD_PRICE_ID = 'price_1JGSNYCXZdSttUYjlXixrrLH';
const PRO_ANNUAL_PROD_PRICE_ID = 'price_1JGSNYCXZdSttUYjj6EoZVez';

export enum PlanId {
  Basic = 'basic',
  Pro = 'pro',
}

export enum BillingFrequency {
  Monthly = 'monthly',
  Annual = 'annual',
}

export enum Feature {
  NumOfNotes = 'num-of-notes',
}

export type Price = {
  amount: number;
  frequency: BillingFrequency;
  priceId?: string;
};

export type Plan = {
  id: PlanId;
  name: string;
  productId: string | null;
  prices: Record<BillingFrequency, Price>;
  features: readonly { name: Feature; amount: number }[];
};

type Plans = { basic: Plan; pro: Plan };

export const PRICING_PLANS: Plans = {
  [PlanId.Basic]: {
    id: PlanId.Basic,
    name: 'Basic',
    productId: null,
    prices: {
      [BillingFrequency.Monthly]: {
        frequency: BillingFrequency.Monthly,
        amount: 0,
      },
      [BillingFrequency.Annual]: {
        frequency: BillingFrequency.Annual,
        amount: 0,
      },
    },
    features: [{ name: Feature.NumOfNotes, amount: 50 }],
  },
  [PlanId.Pro]: {
    id: PlanId.Pro,
    name: 'Pro',
    productId: isDev ? PRO_DEV_PRODUCT_ID : PRO_PROD_PRODUCT_ID,
    prices: {
      [BillingFrequency.Monthly]: {
        frequency: BillingFrequency.Monthly,
        amount: 700,
        priceId: isDev ? PRO_MONTHLY_DEV_PRICE_ID : PRO_MONTHLY_PROD_PRICE_ID,
      },
      [BillingFrequency.Annual]: {
        frequency: BillingFrequency.Annual,
        amount: 7000,
        priceId: isDev ? PRO_ANNUAL_DEV_PRICE_ID : PRO_ANNUAL_PROD_PRICE_ID,
      },
    },
    features: [{ name: Feature.NumOfNotes, amount: Number.POSITIVE_INFINITY }],
  },
} as const;

export const getPlanIdByProductId = (productId: string | null) => {
  for (const plan of Object.values(PRICING_PLANS)) {
    if (plan.productId === productId) {
      return plan.id;
    }
  }
  return PlanId.Basic;
};

export const getFrequencyByPriceId = (priceId: string): BillingFrequency => {
  for (const plan of Object.values(PRICING_PLANS)) {
    for (const price of Object.values(plan.prices)) {
      if (price.priceId === priceId) {
        return price.frequency;
      }
    }
  }
  return BillingFrequency.Monthly;
};
