import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Cors from 'micro-cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Subscription, SubscriptionStatus, User } from 'types/supabase';
import { getFrequencyByPriceId, getPlanIdByProductId } from 'constants/pricing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_KEY ?? ''
);

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
    const message =
      err instanceof Error
        ? err.message
        : 'There was a problem constructing the Stripe webhook event.';
    res.status(400).send(`Webhook Error: ${message}`);
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

    if (!userId || !customerId || !subscriptionId) {
      res.status(500).send('Invalid user id, customer id, or subscription id');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const isSubscriptionActive = subscription.status === 'active';
    const currentPeriodEnd = subscription.current_period_end * 1000;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    const priceId = subscription.items.data[0].price.id;
    const product = subscription.items.data[0].price.product;
    const productId =
      typeof product === 'string' ? product : product?.id ?? null;

    // Create new subscription
    const { data: subscriptionData } = await supabase
      .from<Subscription>('subscriptions')
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_id: getPlanIdByProductId(productId),
          subscription_status: isSubscriptionActive
            ? SubscriptionStatus.Active
            : SubscriptionStatus.Inactive,
          frequency: getFrequencyByPriceId(priceId),
          current_period_end: new Date(currentPeriodEnd).toISOString(),
          cancel_at_period_end: cancelAtPeriodEnd,
        },
        { onConflict: 'user_id' }
      )
      .single();

    // Add subscription id to user
    await supabase
      .from<User>('users')
      .update({ subscription_id: subscriptionData?.id })
      .eq('id', userId);
  } else if (
    event.type === 'invoice.paid' ||
    event.type === 'invoice.payment_failed'
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id ?? null;

    if (!subscriptionId) {
      res.status(500).send('Invalid subscription id');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const isSubscriptionActive = subscription.status === 'active';

    // Update subscription status
    await supabase
      .from<Subscription>('subscriptions')
      .update({
        subscription_status: isSubscriptionActive
          ? SubscriptionStatus.Active
          : SubscriptionStatus.Inactive,
      })
      .eq('stripe_subscription_id', subscriptionId);
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const isSubscriptionActive = subscription.status === 'active';
    const currentPeriodEnd = subscription.current_period_end * 1000;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    const priceId = subscription.items.data[0].price.id;
    const product = subscription.items.data[0].price.product;
    const productId =
      typeof product === 'string' ? product : product?.id ?? null;

    // Update subscription status and plan id
    await supabase
      .from<Subscription>('subscriptions')
      .update({
        plan_id: getPlanIdByProductId(productId),
        subscription_status: isSubscriptionActive
          ? SubscriptionStatus.Active
          : SubscriptionStatus.Inactive,
        frequency: getFrequencyByPriceId(priceId),
        current_period_end: new Date(currentPeriodEnd).toISOString(),
        cancel_at_period_end: cancelAtPeriodEnd,
      })
      .eq('stripe_subscription_id', subscription.id);
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const isSubscriptionActive = subscription.status === 'active';

    // Update subscription status
    await supabase
      .from<Subscription>('subscriptions')
      .update({
        subscription_status: isSubscriptionActive
          ? SubscriptionStatus.Active
          : SubscriptionStatus.Inactive,
      })
      .eq('stripe_subscription_id', subscription.id);
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
