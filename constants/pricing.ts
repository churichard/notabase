const isDev = process.env.NODE_ENV === 'development';

const PRO_MONTHLY_DEV_PRICE_ID = 'price_1JGSVLCXZdSttUYj13lhWEzJ';
const PRO_ANNUAL_DEV_PRICE_ID = 'price_1JGSVLCXZdSttUYj2LUZT3T5';

const PRO_MONTHLY_PROD_PRICE_ID = 'price_1JGSNYCXZdSttUYjlXixrrLH';
const PRO_ANNUAL_PROD_PRICE_ID = 'price_1JGSNYCXZdSttUYjj6EoZVez';

export enum PlanId {
  Basic = 'basic',
  Pro = 'pro',
}

export enum PriceId {
  Monthly = 'monthly',
  Annual = 'annual',
}

export type Price = {
  amount: number;
  priceId?: string;
};

export type Plan = {
  id: PlanId;
  name: string;
  prices: {
    monthly: Price;
    annual: Price;
  };
};

type Plans = { basic: Plan; pro: Plan };

const PRICING_PLANS: Plans = {
  [PlanId.Basic]: {
    id: PlanId.Basic,
    name: 'Basic',
    prices: {
      [PriceId.Monthly]: {
        amount: 0,
      },
      [PriceId.Annual]: {
        amount: 0,
      },
    },
  },
  [PlanId.Pro]: {
    id: PlanId.Pro,
    name: 'Pro',
    prices: {
      [PriceId.Monthly]: {
        amount: 700,
        priceId: isDev ? PRO_MONTHLY_DEV_PRICE_ID : PRO_MONTHLY_PROD_PRICE_ID,
      },
      [PriceId.Annual]: {
        amount: 7000,
        priceId: isDev ? PRO_ANNUAL_DEV_PRICE_ID : PRO_ANNUAL_PROD_PRICE_ID,
      },
    },
  },
} as const;

export { PRICING_PLANS };
