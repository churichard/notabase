import { useMemo, useState } from 'react';
import { useStore } from 'lib/store';
import useHotkeys from 'utils/useHotkeys';
import { Visibility } from 'types/supabase';
import SelectMenu from 'components/SelectMenu';

const VISIBILITY_ITEMS = [
  { id: 'private', name: 'Private', value: Visibility.Private },
  { id: 'public', name: 'Public', value: Visibility.Public },
];

export default function PublishModal() {
  const [visibility, setVisibility] = useState<Visibility>(
    VISIBILITY_ITEMS[0].value
  );

  const setIsPublishModalOpen = useStore(
    (state) => state.setIsPublishModalOpen
  );

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'esc',
        callback: () => setIsPublishModalOpen(false),
      },
    ],
    [setIsPublishModalOpen]
  );
  useHotkeys(hotkeys);

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-30"
        onClick={() => setIsPublishModalOpen(false)}
      />
      <div className="flex h-screen items-center justify-center p-6">
        <div className="z-30 flex h-full w-full max-w-full flex-col overflow-hidden rounded bg-white shadow-popover sm:max-h-176 sm:w-240 sm:flex-row">
          <div className="h-full w-full flex-1 overflow-y-auto p-6 dark:bg-gray-800 dark:text-gray-100">
            <div className="mb-4">
              <h1 className="text-lg font-medium">
                Publish your note to the web
              </h1>
            </div>
            <SelectMenu
              value={visibility}
              onChange={setVisibility}
              items={VISIBILITY_ITEMS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
