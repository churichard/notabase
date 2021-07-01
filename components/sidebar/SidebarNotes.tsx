import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu } from '@headlessui/react';
import { IconDots, IconTrash } from '@tabler/icons';
import { usePopper } from 'react-popper';
import type { Note } from 'types/supabase';
import { store, useStore, deepEqual } from 'lib/store';
import deleteNote from 'lib/api/deleteNote';
import useBacklinks from 'editor/useBacklinks';
import { caseInsensitiveStringCompare } from 'utils/string';
import Portal from '../Portal';
import ErrorBoundary from '../ErrorBoundary';
import SidebarItem from './SidebarItem';

type SidebarNotesProps = {
  currentNoteId?: string;
  className?: string;
};

export default function SidebarNotes(props: SidebarNotesProps) {
  const { currentNoteId, className } = props;

  const notes = useStore(
    (state) =>
      Object.values(state.notes)
        .map((note) => ({ id: note.id, title: note.title }))
        .sort((n1, n2) => caseInsensitiveStringCompare(n1.title, n2.title)),
    deepEqual
  );

  return (
    <ErrorBoundary>
      <div className={className}>
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <NoteLink
              key={note.id}
              note={note}
              isHighlighted={note.id === currentNoteId}
            />
          ))
        ) : (
          <p className="px-6 my-2 text-gray-500">No notes yet</p>
        )}
      </div>
    </ErrorBoundary>
  );
}

type NoteLinkProps = {
  note: Pick<Note, 'id' | 'title'>;
  isHighlighted?: boolean;
};

const NoteLink = (props: NoteLinkProps) => {
  const { note, isHighlighted } = props;
  return (
    <SidebarItem
      className="relative flex items-center justify-between group"
      isHighlighted={isHighlighted}
    >
      <Link href={`/app/note/${note.id}`}>
        <a className="flex-1 px-6 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {note.title}
        </a>
      </Link>
      <NoteLinkDropdown note={note} className="hidden group-hover:block" />
    </SidebarItem>
  );
};

type NoteLinkDropdownProps = {
  note: Pick<Note, 'id' | 'title'>;
  className?: string;
};

const NoteLinkDropdown = (props: NoteLinkDropdownProps) => {
  const { note, className } = props;
  const router = useRouter();
  const { deleteBacklinks } = useBacklinks(note.id);
  const openNotes = useStore((state) => state.openNotes);

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
    await deleteBacklinks();

    const deletedNoteIndex = openNotes.findIndex(
      (openNote) => openNote.id === note.id
    );
    if (deletedNoteIndex !== -1) {
      // Redirect if one of the notes that was deleted was open
      const newNoteId = Object.keys(store.getState().notes)[0];
      router.push(`/app/note/${newNoteId}`, undefined, { shallow: true });
    }
  }, [router, note.id, openNotes, deleteBacklinks]);

  return (
    <div ref={containerRef}>
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button
              className={`p-1 rounded hover:bg-gray-300 active:bg-gray-400 ${className}`}
            >
              <IconDots className="text-gray-600" />
            </Menu.Button>
            {open && (
              <Portal>
                <Menu.Items
                  ref={setPopperElement}
                  className="z-10 w-48 bg-white rounded shadow-popover"
                  static
                  style={styles.popper}
                  {...attributes.popper}
                >
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-gray-800 ${
                          active ? 'bg-gray-100' : ''
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
