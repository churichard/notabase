import { useMemo } from 'react';
import { MAX_NUM_OF_BASIC_NOTES, PlanId } from 'constants/pricing';
import { useStore } from 'lib/store';

export default function UpgradeBanner() {
  const billingDetails = useStore((state) => state.billingDetails);
  const numOfNotes = useStore((state) => Object.keys(state.notes).length);
  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
  );

  const showUpgradeBanner = useMemo(
    () =>
      billingDetails.planId === PlanId.Basic &&
      numOfNotes >= MAX_NUM_OF_BASIC_NOTES - 10,
    [billingDetails, numOfNotes]
  );

  return showUpgradeBanner ? (
    <button
      className="block w-full bg-yellow-300 py-1 text-center font-semibold text-yellow-900"
      onClick={() => setIsUpgradeModalOpen(true)}
    >
      You have {numOfNotes < MAX_NUM_OF_BASIC_NOTES ? 'almost' : ''} reached
      your {MAX_NUM_OF_BASIC_NOTES} note limit. Upgrade now for unlimited notes.
    </button>
  ) : null;
}
