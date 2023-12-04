const isDev = process.env.NODE_ENV === 'development';

const PRO_DEV_PRODUCT_ID = 'prod_JuH32Q7obJDLdu';
const PRO_MONTHLY_DEV_PRICE_ID = 'price_1JGSVLCXZdSttUYj13lhWEzJ';
const PRO_ANNUAL_DEV_PRICE_ID = 'price_1JGSVLCXZdSttUYj2LUZT3T5';

const PRO_PROD_PRODUCT_ID = 'prod_JuGvuo7cLr1UF7';
const PRO_MONTHLY_PROD_PRICE_ID = 'price_1MQy2MCXZdSttUYjUGfCB1Z4';
const PRO_ANNUAL_PROD_PRICE_ID = 'price_1MQy1xCXZdSttUYjLbsUOwPn';

const CATALYST_DEV_PRODUCT_ID = 'prod_KOcUXd1Nhw26xb';
const CATALYST_DEV_PRICE_ID = 'price_1JjpFYCXZdSttUYj0xNwhxnR';

const CATALYST_PROD_PRODUCT_ID = 'prod_KP0b9KmLK40Zqg';
const CATALYST_PROD_PRICE_ID = 'price_1JkCaYCXZdSttUYj45twL98c';

export enum PlanId {
  Basic = 'basic',
  Pro = 'pro',
  Catalyst = 'catalyst',
}

export enum BillingFrequency {
  Monthly = 'monthly',
  Annual = 'annual',
  OneTime = 'one_time',
}

export enum Feature {
  NumOfNotes = 'num-of-notes',
  Publish = 'publish',
}

export type Price = {
  amount: number;
  frequency: BillingFrequency;
  priceId?: string;
};

type PlanPrices = SubscriptionPrices | OneTimePrices;
type SubscriptionPrices = {
  [BillingFrequency.Monthly]: Price;
  [BillingFrequency.Annual]: Price;
};
type OneTimePrices = { [BillingFrequency.OneTime]: Price };

type PlanFeature = { name: Feature; amount: number };

export type Plan<Prices extends PlanPrices> = {
  id: PlanId;
  name: string;
  productId: string | null;
  prices: Prices;
  features: readonly PlanFeature[];
};

export const MAX_NUM_OF_BASIC_NOTES = 100;

const BASIC_FEATURES: PlanFeature[] = [
  { name: Feature.NumOfNotes, amount: MAX_NUM_OF_BASIC_NOTES },
  { name: Feature.Publish, amount: 0 },
];
const PRO_FEATURES: PlanFeature[] = [
  { name: Feature.NumOfNotes, amount: Number.POSITIVE_INFINITY },
  { name: Feature.Publish, amount: 1 },
];

type Plans = {
  [PlanId.Basic]: Plan<SubscriptionPrices>;
  [PlanId.Pro]: Plan<SubscriptionPrices>;
  [PlanId.Catalyst]: Plan<OneTimePrices>;
};

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
    features: BASIC_FEATURES,
  },
  [PlanId.Pro]: {
    id: PlanId.Pro,
    name: 'Pro',
    productId: isDev ? PRO_DEV_PRODUCT_ID : PRO_PROD_PRODUCT_ID,
    prices: {
      [BillingFrequency.Monthly]: {
        frequency: BillingFrequency.Monthly,
        amount: 800,
        priceId: isDev ? PRO_MONTHLY_DEV_PRICE_ID : PRO_MONTHLY_PROD_PRICE_ID,
      },
      [BillingFrequency.Annual]: {
        frequency: BillingFrequency.Annual,
        amount: 8000,
        priceId: isDev ? PRO_ANNUAL_DEV_PRICE_ID : PRO_ANNUAL_PROD_PRICE_ID,
      },
    },
    features: PRO_FEATURES,
  },
  [PlanId.Catalyst]: {
    id: PlanId.Catalyst,
    name: 'Catalyst',
    productId: isDev ? CATALYST_DEV_PRODUCT_ID : CATALYST_PROD_PRODUCT_ID,
    prices: {
      [BillingFrequency.OneTime]: {
        frequency: BillingFrequency.OneTime,
        amount: 30000,
        priceId: isDev ? CATALYST_DEV_PRICE_ID : CATALYST_PROD_PRICE_ID,
      },
    },
    features: PRO_FEATURES,
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

export const isSubscription = (
  prices: PlanPrices
): prices is SubscriptionPrices => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(prices as any).monthly && !!(prices as any).annual;
};
