import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Cors from 'micro-cors';
import Stripe from 'stripe';
import supabase from 'lib/supabase';
import { SubscriptionStatus, User } from 'types/supabase';
import { getPlanIdByProductId } from 'constants/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2020-08-27',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] ?? '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id ?? null;
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id ?? null;

    // Store billing data in database
    if (!userId || !customerId || !subscriptionId) {
      return;
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const isSubscriptionActive = subscription.status === 'active';
    const product = subscription.items.data[0].price.product;
    const productId =
      typeof product === 'string' ? product : product?.id ?? null;

    await supabase
      .from<User>('users')
      .update({
        billing_data: {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: isSubscriptionActive
            ? SubscriptionStatus.ACTIVE
            : SubscriptionStatus.INACTIVE,
          plan_id: getPlanIdByProductId(productId),
        },
      })
      .eq('id', userId);
  }

  res.json({ received: true });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default cors(webhookHandler as any);

export const config = {
  api: {
    bodyParser: false,
  },
};
