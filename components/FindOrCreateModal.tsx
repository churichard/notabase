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
    <div className="fixed inset-0 overflow-y-auto">
      <div
        className="fixed inset-0 z-10 bg-black opacity-30"
        onClick={() => setIsOpen(false)}
      />
      <div className="flex justify-center mt-32">
        <FindOrCreateInput
          onOptionClick={() => setIsOpen(false)}
          className="z-20 w-screen max-w-screen-sm mx-6 bg-white rounded shadow-popover"
        />
      </div>
    </div>
  );
}
