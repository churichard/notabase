import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Subscription } from 'types/supabase';

const supabase = createClient(
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

  const { userId, userEmail, priceId, redirectPath = '/app' } = req.body;

  if (!userId || !priceId || !userEmail) {
    return res.status(400).json({ message: 'Invalid params' });
  }

  const { data } = await supabase
    .from<Subscription>('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();
  const stripeCustomerId = data?.stripe_customer_id;

  try {
    const baseUrl = process.env.BASE_URL ?? 'https://notabase.io';
    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId,
      ...(stripeCustomerId
        ? { customer: stripeCustomerId }
        : { customer_email: userEmail }),
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}${redirectPath}?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${redirectPath}`,
    });
    res.json({ sessionId: session.id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
