import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Database } from 'types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_KEY ?? ''
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2020-08-27',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }

  const { userId, redirectPath = '/app' } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Invalid params' });
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();
  const stripeCustomerId = data?.stripe_customer_id;

  if (!stripeCustomerId) {
    return res
      .status(500)
      .json({ message: `Customer id for user ${userId} was not found` });
  }

  try {
    const baseUrl = process.env.BASE_URL ?? 'https://notabase.io';
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}${redirectPath}`,
    });
    res.json({ sessionUrl: session.url });
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : 'There was a problem creating the billing portal session.';
    res.status(500).json({ message });
  }
}
