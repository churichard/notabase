import { memo, useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import { IconCornerDownRight, IconDots, IconTrash } from '@tabler/icons';
import { usePopper } from 'react-popper';
import { Note } from 'types/supabase';
import { DropdownItem } from 'components/Dropdown';
import MoveToModal from 'components/MoveToModal';
import NoteMetadata from 'components/NoteMetadata';
import useDeleteNote from 'utils/useDeleteNote';
import Portal from '../Portal';

type Props = {
  note: Note;
  className?: string;
};

const SidebarNoteLinkDropdown = (props: Props) => {
  const { note, className } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    containerRef.current,
    popperElement,
    { placement: 'right-start' }
  );

  const [isMoveToModalOpen, setIsMoveToModalOpen] = useState(false);
  const onMoveToClick = useCallback(() => setIsMoveToModalOpen(true), []);

  const onDeleteClick = useDeleteNote(note.id);

  return (
    <div ref={containerRef}>
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button
              className={`p-1 rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-600 dark:active:bg-gray-500 ${className}`}
            >
              <IconDots className="text-gray-600 dark:text-gray-200" />
            </Menu.Button>
            {open && (
              <Portal>
                <Menu.Items
                  ref={setPopperElement}
                  className="z-20 w-56 overflow-hidden bg-white rounded shadow-popover dark:bg-gray-800 focus:outline-none"
                  static
                  style={styles.popper}
                  {...attributes.popper}
                >
                  <DropdownItem onClick={onDeleteClick}>
                    <IconTrash size={18} className="mr-1" />
                    <span>Delete</span>
                  </DropdownItem>
                  <DropdownItem onClick={onMoveToClick}>
                    <IconCornerDownRight size={18} className="mr-1" />
                    <span>Move to</span>
                  </DropdownItem>
                  <NoteMetadata note={note} />
                </Menu.Items>
              </Portal>
            )}
          </>
        )}
      </Menu>
      {isMoveToModalOpen ? (
        <Portal>
          <MoveToModal noteId={note.id} setIsOpen={setIsMoveToModalOpen} />
        </Portal>
      ) : null}
    </div>
  );
};

export default memo(SidebarNoteLinkDropdown);
