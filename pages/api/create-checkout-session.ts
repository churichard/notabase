import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

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

  const { priceId, redirectPath = '/app' } = req.body;

  if (!priceId) {
    return res.status(400).json({ message: 'priceId is required' });
  }

  try {
    const baseUrl = process.env.BASE_URL ?? 'https://notabase.io';
    const session = await stripe.checkout.sessions.create({
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
