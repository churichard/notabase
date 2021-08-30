import { CSSProperties, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu } from '@headlessui/react';
import { IconDots, IconTrash } from '@tabler/icons';
import { usePopper } from 'react-popper';
import { Note } from 'types/supabase';
import { store, useStore } from 'lib/store';
import deleteNote from 'lib/api/deleteNote';
import deleteBacklinks from 'editor/backlinks/deleteBacklinks';
import Portal from '../Portal';
import SidebarItem from './SidebarItem';

type Props = {
  note: Pick<Note, 'id' | 'title'>;
  isHighlighted?: boolean;
  style?: CSSProperties;
};

export const SidebarNoteLink = (props: Props) => {
  const { note, isHighlighted, style } = props;
  return (
    <SidebarItem
      className="relative flex items-center justify-between group"
      isHighlighted={isHighlighted}
      style={style}
    >
      <Link href={`/app/note/${note.id}`}>
        <a className="flex-1 px-6 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {note.title}
        </a>
      </Link>
      <SidebarNoteLinkDropdown
        note={note}
        className="hidden group-hover:block"
      />
    </SidebarItem>
  );
};

type SidebarNoteLinkDropdownProps = {
  note: Pick<Note, 'id' | 'title'>;
  className?: string;
};

const SidebarNoteLinkDropdown = (props: SidebarNoteLinkDropdownProps) => {
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
    { placement: 'right' }
  );

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
                  className="z-10 w-48 overflow-hidden bg-white rounded shadow-popover dark:bg-gray-800"
                  static
                  style={styles.popper}
                  {...attributes.popper}
                >
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-gray-800 dark:text-gray-200 ${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                        onClick={onDeleteClick}
                      >
                        <IconTrash size={18} className="mr-1" />
                        <span>Delete</span>
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Portal>
            )}
          </>
        )}
      </Menu>
    </div>
  );
};
