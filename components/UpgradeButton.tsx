import { useMemo } from 'react';
import { IconArrowUpCircle } from '@tabler/icons';
import { Feature, MAX_NUM_OF_BASIC_NOTES } from 'constants/pricing';
import { useStore } from 'lib/store';
import Tooltip from './Tooltip';

type Props = {
  feature: Feature;
  className?: string;
};

export default function UpgradeButton(props: Props) {
  const { feature, className = '' } = props;

  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
  );

  const content = useMemo(() => {
    if (feature === Feature.NumOfNotes) {
      return `You have reached your ${MAX_NUM_OF_BASIC_NOTES} note limit. Upgrade to Pro for unlimited notes.`;
    } else {
      return 'Upgrade to Pro to access all features.';
    }
  }, [feature]);

  return (
    <Tooltip content={content}>
      <span
        className={`flex items-center p-2 text-xs btn ${className}`}
        onClick={() => setIsUpgradeModalOpen(true)}
      >
        <IconArrowUpCircle size={18} className="flex-shrink-0 mr-1" />
        <span className="whitespace-nowrap">Upgrade to Pro</span>
      </span>
    </Tooltip>
  );
}
