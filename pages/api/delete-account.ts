import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { BillingFrequency } from 'constants/pricing';
import { Database, SubscriptionStatus } from 'types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_KEY ?? ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const token = req.headers.authorization?.replace('Bearer ', '').trim();
  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    res
      .status(401)
      .json({ message: authError?.message ?? 'Unable to validate user' });
    return;
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('id, subscription_status, cancel_at_period_end, frequency')
    .eq('user_id', user.id)
    .maybeSingle();

  if (subscriptionError) {
    res
      .status(500)
      .json({ message: subscriptionError.message ?? 'Failed to load billing' });
    return;
  }

  const hasActiveSubscription =
    subscription &&
    subscription.subscription_status === SubscriptionStatus.Active &&
    subscription.frequency !== BillingFrequency.OneTime &&
    !subscription.cancel_at_period_end;

  if (hasActiveSubscription) {
    res.status(400).json({
      message: 'Cancel your subscription before deleting your account.',
    });
    return;
  }

  const { error: revokeError } = await supabase.auth.admin.signOut(token);
  if (revokeError) {
    res
      .status(500)
      .json({ message: revokeError.message ?? 'Failed to revoke sessions' });
    return;
  }

  const storageError = await deleteUserAssets(user.id);
  if (storageError) {
    res
      .status(500)
      .json({ message: storageError.message ?? 'Failed to delete assets' });
    return;
  }

  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
    user.id
  );
  if (deleteAuthError) {
    res.status(500).json({
      message: deleteAuthError.message ?? 'Failed to delete user account',
    });
    return;
  }

  res.status(200).json({ message: 'Account deleted' });
}

const deleteUserAssets = async (userId: string) => {
  // Delete all objects under the user's folder in the user-assets bucket.
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.storage
      .from('user-assets')
      .list(userId, { limit, offset });
    if (error) {
      return error;
    }
    const files = data ?? [];
    if (files.length === 0) {
      hasMore = false;
      continue;
    }
    const paths = files.map((file) => `${userId}/${file.name}`);
    const { error: removeError } = await supabase.storage
      .from('user-assets')
      .remove(paths);
    if (removeError) {
      return removeError;
    }
    hasMore = files.length === limit;
    offset += limit;
  }
  return null;
};
