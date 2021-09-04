import { useMemo } from 'react';
import { Feature, PRICING_PLANS } from 'constants/pricing';
import { useStore } from 'lib/store';

export default function useFeature(feature: Feature) {
  const billingDetails = useStore((state) => state.billingDetails);

  const numOfNotes = useStore((state) => Object.keys(state.notes).length);

  // Whether or not the particular user can actually use the feature
  const isEnabled = useMemo(() => {
    const planFeature = PRICING_PLANS[billingDetails.planId].features.find(
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
  }, [numOfNotes, feature, billingDetails]);

  return isEnabled;
}
