import React, { useRef } from 'react';
import { Dialog } from '@headlessui/react';
import FindOrCreateInput from './FindOrCreateInput';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function FindOrCreateModal(props: Props) {
  const { isOpen, setIsOpen } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Dialog
      initialFocus={inputRef}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="fixed inset-0 overflow-y-auto"
    >
      <Dialog.Overlay className="fixed inset-0 z-10 bg-black opacity-30" />
      <div className="flex justify-center mt-32">
        <FindOrCreateInput
          ref={inputRef}
          onOptionClick={() => setIsOpen(false)}
          className="z-20 w-screen max-w-screen-sm mx-6 bg-white rounded shadow-popover"
        />
      </div>
    </Dialog>
  );
}
