import { memo, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Menu } from '@headlessui/react';
import { IconCornerDownRight, IconDots, IconTrash } from '@tabler/icons';
import { usePopper } from 'react-popper';
import { Note } from 'types/supabase';
import { store, useStore } from 'lib/store';
import deleteNote from 'lib/api/deleteNote';
import deleteBacklinks from 'editor/backlinks/deleteBacklinks';
import { DropdownItem } from 'components/Dropdown';
import MoveToModal from 'components/MoveToModal';
import Portal from '../Portal';

type Props = {
  note: Note;
  className?: string;
};

const SidebarNoteLinkDropdown = (props: Props) => {
  const { note, className } = props;
  const router = useRouter();
  const openNoteIds = useStore((state) => state.openNoteIds);

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

  const onDeleteClick = useCallback(async () => {
    await deleteNote(note.id);
    await deleteBacklinks(note.id);

    const deletedNoteIndex = openNoteIds.findIndex(
      (openNoteId) => openNoteId === note.id
    );
    if (deletedNoteIndex !== -1) {
      // Redirect if one of the notes that was deleted was open
      const newNoteId = Object.keys(store.getState().notes)[0];
      router.push(`/app/note/${newNoteId}`, undefined, { shallow: true });
    }
  }, [router, note.id, openNoteIds]);

  const onMoveToClick = useCallback(async () => {
    setIsMoveToModalOpen(true);
  }, []);

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
                  className="z-20 w-56 overflow-hidden bg-white rounded shadow-popover dark:bg-gray-800"
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
                  <div className="px-4 py-2 space-y-1 text-xs text-gray-600 border-t dark:border-gray-700 dark:text-gray-400">
                    <p>
                      Last modified at {getReadableDatetime(note.updated_at)}
                    </p>
                    <p>Created at {getReadableDatetime(note.created_at)}</p>
                  </div>
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

const getReadableDatetime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};
