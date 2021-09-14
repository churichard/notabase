import { useMemo } from 'react';
import useHotkeys from 'utils/useHotkeys';
import MoveToInput from './MoveToInput';

type Props = {
  noteId: string;
  setIsOpen: (isOpen: boolean) => void;
};

export default function MoveToModal(props: Props) {
  const { noteId, setIsOpen } = props;

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
      <div className="flex justify-center px-6 max-h-screen-80 my-screen-10">
        <MoveToInput
          noteId={noteId}
          onOptionClick={() => setIsOpen(false)}
          className="z-30 w-full max-w-screen-sm bg-white rounded shadow-popover dark:bg-gray-800"
        />
      </div>
    </div>
  );
}
