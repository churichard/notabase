import { useMemo } from 'react';
import { Feature, PRICING_PLANS } from 'constants/pricing';
import { useStore } from 'lib/store';
import { useBilling } from './useBilling';

export default function useFeature(feature: Feature) {
  const { subscription } = useBilling();

  const numOfNotes = useStore((state) => Object.keys(state.notes).length);

  // Whether or not the feature is enabled for the particular billing plan
  const isFeatureEnabled = useMemo(
    () =>
      (subscription &&
        PRICING_PLANS[subscription.planId].features.includes(feature)) ??
      false,
    [feature, subscription]
  );

  // Whether or not the particular user can actually use the feature
  const canUseFeature = useMemo(() => {
    switch (feature) {
      case Feature.UnlimitedNotes:
        return numOfNotes < 50 || isFeatureEnabled;
      default:
        return false;
    }
  }, [isFeatureEnabled, numOfNotes, feature]);

  return canUseFeature;
}
