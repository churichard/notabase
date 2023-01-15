import { useMemo } from 'react';
import useHotkeys from 'utils/useHotkeys';
import FindOrCreateInput from './FindOrCreateInput';

type Props = {
  setIsOpen: (isOpen: boolean) => void;
};

export default function FindOrCreateModal(props: Props) {
  const { setIsOpen } = props;

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'esc',
        callback: () => setIsOpen(false),
      },
    ],
    [setIsOpen]
  );
  useHotkeys(hotkeys);

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-30"
        onClick={() => setIsOpen(false)}
      />
      <div className="my-screen-10 flex max-h-screen-80 justify-center px-6">
        <FindOrCreateInput
          onOptionClick={() => setIsOpen(false)}
          className="z-30 w-full max-w-screen-sm rounded bg-white shadow-popover dark:bg-gray-800"
        />
      </div>
    </div>
  );
}
