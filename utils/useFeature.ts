import { useMemo } from 'react';
import { Feature, PRICING_PLANS } from 'constants/pricing';
import { useStore } from 'lib/store';
import { useBilling } from './useBilling';

export default function useFeature(feature: Feature) {
  const { subscription } = useBilling();

  const numOfNotes = useStore((state) => Object.keys(state.notes).length);

  // Whether or not the particular user can actually use the feature
  const isEnabled = useMemo(() => {
    if (!subscription) {
      return false;
    }

    const planFeature = PRICING_PLANS[subscription.planId].features.find(
      (f) => f.name === feature
    );

    if (!planFeature) {
      return false;
    }

    switch (feature) {
      case Feature.NumOfNotes:
        return numOfNotes < planFeature.amount;
      default:
        return false;
    }
  }, [numOfNotes, feature, subscription]);

  return isEnabled;
}
