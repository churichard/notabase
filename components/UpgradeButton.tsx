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
    switch (feature) {
      case Feature.NumOfNotes:
        return `You have reached your ${MAX_NUM_OF_BASIC_NOTES} note limit. Upgrade to Notabase Pro for unlimited notes.`;
      case Feature.Publish:
        return 'Upgrade to Notabase Pro to publish your notes on the web.';
      default:
        return 'Upgrade to Notabase Pro to access all features.';
    }
  }, [feature]);

  return (
    <Tooltip content={content}>
      <button
        className={`btn flex items-center p-2 text-sm ${className}`}
        onClick={() => setIsUpgradeModalOpen(true)}
      >
        <IconArrowUpCircle size={18} className="mr-1 flex-shrink-0" />
        <span className="whitespace-nowrap">Upgrade to Pro</span>
      </button>
    </Tooltip>
  );
}
