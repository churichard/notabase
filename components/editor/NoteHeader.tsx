import { useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconDots,
  IconDownload,
  IconUpload,
  IconCloudDownload,
  IconX,
  IconTrash,
  IconCornerDownRight,
} from '@tabler/icons';
import { usePopper } from 'react-popper';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useRouter } from 'next/router';
import Portal from 'components/Portal';
import { useCurrentNote } from 'utils/useCurrentNote';
import { store, useStore } from 'lib/store';
import serialize from 'editor/serialization/serialize';
import { Note } from 'types/supabase';
import useImport from 'utils/useImport';
import { queryParamToArray } from 'utils/url';
import Tooltip from 'components/Tooltip';
import OpenSidebarButton from 'components/sidebar/OpenSidebarButton';
import { DropdownItem } from 'components/Dropdown';
import useDeleteNote from 'utils/useDeleteNote';
import NoteMetadata from 'components/NoteMetadata';
import MoveToModal from 'components/MoveToModal';

export default function NoteHeader() {
  const currentNote = useCurrentNote();
  const onImport = useImport();
  const router = useRouter();
  const {
    query: { stack: stackQuery },
  } = router;

  const isSidebarButtonVisible = useStore(
    (state) => !state.isSidebarOpen && state.openNoteIds?.[0] === currentNote.id
  );
  const isCloseButtonVisible = useStore(
    (state) => (state.openNoteIds.length > 1)
  );
  const note = useStore((state) => state.notes[currentNote.id]);

  const onClosePane = useCallback(() => {
    const currentNoteIndex = store
      .getState()
      .openNoteIds.findIndex((openNoteId) => openNoteId === currentNote.id);
    const stackedNoteIds = queryParamToArray(stackQuery);

    if (currentNoteIndex < 0) {
      return;
    }

    if (currentNoteIndex == 0) {
      // Changes Current Note to first note in stack 
      currentNote.id = stackedNoteIds.shift();
      router.push(
        {
          pathname: router.pathname,
          query: { ...currentNote, stack: stackedNoteIds },
        },
        undefined,
        { shallow: true }
      );
    }

    else {// Remove from stacked notes and shallowly route
      stackedNoteIds.splice(
        currentNoteIndex - 1, // Stacked notes don't include the main note
        1
      );
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, stack: stackedNoteIds },
        },
        undefined,
        { shallow: true }
      );
    }

  }, [currentNote.id, stackQuery, router]);

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    popperElement,
    { placement: 'bottom-start' }
  );

  const onExportClick = useCallback(async () => {
    saveAs(getNoteAsBlob(note), `${note.title}.md`);
  }, [note]);

  const onExportAllClick = useCallback(async () => {
    const zip = new JSZip();

    const notes = Object.values(store.getState().notes);
    for (const note of notes) {
      zip.file(`${note.title}.md`, getNoteAsBlob(note));
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, 'notabase-export.zip');
  }, []);

  const onDeleteClick = useDeleteNote(currentNote.id);

  const [isMoveToModalOpen, setIsMoveToModalOpen] = useState(false);
  const onMoveToClick = useCallback(() => setIsMoveToModalOpen(true), []);

  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  return (
    <div className="flex items-center justify-between w-full px-4 py-1 text-right">
      <div>{isSidebarButtonVisible ? <OpenSidebarButton /> : null}</div>
      <div>
        {isCloseButtonVisible ? (
          <Tooltip content="Close pane">
            <button className={buttonClassName} onClick={onClosePane}>
              <span className="flex items-center justify-center w-8 h-8">
                <IconX className={iconClassName} />
              </span>
            </button>
          </Tooltip>
        ) : null}
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button ref={menuButtonRef} className={buttonClassName}>
                <Tooltip content="Options (export, import, etc.)">
                  <span className="flex items-center justify-center w-8 h-8">
                    <IconDots className={iconClassName} />
                  </span>
                </Tooltip>
              </Menu.Button>
              {open && (
                <Portal>
                  <Menu.Items
                    ref={setPopperElement}
                    className="z-10 w-56 overflow-hidden bg-white rounded shadow-popover dark:bg-gray-800 focus:outline-none"
                    static
                    style={styles.popper}
                    {...attributes.popper}
                  >
                    <DropdownItem onClick={onImport}>
                      <IconDownload size={18} className="mr-1" />
                      <span>Import</span>
                    </DropdownItem>
                    <DropdownItem onClick={onExportClick}>
                      <IconUpload size={18} className="mr-1" />
                      <span>Export</span>
                    </DropdownItem>
                    <DropdownItem onClick={onExportAllClick}>
                      <IconCloudDownload size={18} className="mr-1" />
                      <span>Export All</span>
                    </DropdownItem>
                    <DropdownItem
                      onClick={onDeleteClick}
                      className="border-t dark:border-gray-700"
                    >
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
      </div>
      {isMoveToModalOpen ? (
        <Portal>
          <MoveToModal
            noteId={currentNote.id}
            setIsOpen={setIsMoveToModalOpen}
          />
        </Portal>
      ) : null}
    </div>
  );
}

const getSerializedNote = (note: Note) =>
  note.content.map((n) => serialize(n)).join('');

const getNoteAsBlob = (note: Note) => {
  const serializedContent = getSerializedNote(note);
  const blob = new Blob([serializedContent], {
    type: 'text/markdown;charset=utf-8',
  });
  return blob;
};

