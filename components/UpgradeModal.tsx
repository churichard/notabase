import { useMemo } from 'react';
import { useStore } from 'lib/store';
import useHotkeys from 'utils/useHotkeys';
import Billing from './Billing';

export default function UpgradeModal() {
  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
  );

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'esc',
        callback: () => setIsUpgradeModalOpen(false),
      },
    ],
    [setIsUpgradeModalOpen]
  );
  useHotkeys(hotkeys);

  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div
        className="fixed inset-0 z-10 bg-black opacity-30"
        onClick={() => setIsUpgradeModalOpen(false)}
      />
      <div className="flex items-center justify-center h-screen p-6">
        <div className="z-20 flex w-full h-full max-w-full bg-white rounded max-h-128 sm:w-192 xl:w-240 xl:max-h-176 shadow-popover">
          <Billing />
        </div>
      </div>
    </div>
  );
}
