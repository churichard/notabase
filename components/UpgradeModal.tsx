import { useMemo } from 'react';
import { useStore } from 'lib/store';
import useHotkeys from 'utils/useHotkeys';
import Billing from './settings/Billing';

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
    <div className="fixed inset-0 z-20 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-30"
        onClick={() => setIsUpgradeModalOpen(false)}
      />
      <div className="flex h-screen items-center justify-center p-6">
        <div className="z-30 flex h-full max-h-128 w-full max-w-full rounded bg-white shadow-popover dark:bg-gray-800 dark:text-gray-100 sm:w-192 xl:max-h-176 xl:w-240">
          <Billing />
        </div>
      </div>
    </div>
  );
}
