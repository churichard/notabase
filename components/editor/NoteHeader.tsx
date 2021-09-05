import { useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconDots,
  IconDownload,
  IconUpload,
  IconCloudDownload,
  IconX,
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

export default function NoteHeader() {
  const currentNote = useCurrentNote();
  const onImport = useImport();
  const router = useRouter();
  const {
    query: { stack: stackQuery },
  } = router;

  const isCloseButtonVisible = useStore(
    (state) => state.openNoteIds?.[0] !== currentNote.id
  );

  const onClosePane = useCallback(() => {
    const currentNoteIndex = store
      .getState()
      .openNoteIds.findIndex((openNoteId) => openNoteId === currentNote.id);

    if (currentNoteIndex < 0) {
      return;
    }

    // Remove from stacked notes and shallowly route
    const stackedNoteIds = queryParamToArray(stackQuery);
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
  }, [currentNote.id, stackQuery, router]);

  const menuButtonRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    popperElement,
    { placement: 'bottom-start' }
  );

  const onExportClick = useCallback(async () => {
    const note = store.getState().notes[currentNote.id];
    saveAs(getNoteAsBlob(note), `${note.title}.md`);
  }, [currentNote.id]);

  const onExportAllClick = useCallback(async () => {
    const zip = new JSZip();

    const notes = Object.values(store.getState().notes);
    for (const note of notes) {
      zip.file(`${note.title}.md`, getNoteAsBlob(note));
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, 'notabase-export.zip');
  }, []);

  const buttonClassName =
    'p-1 rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  return (
    <div className="flex items-center justify-end w-full px-4 py-1 text-right">
      {isCloseButtonVisible ? (
        <Tooltip content="Close pane">
          <button className={buttonClassName} onClick={onClosePane}>
            <IconX className={iconClassName} />
          </button>
        </Tooltip>
      ) : null}
      <Menu>
        {({ open }) => (
          <>
            <Tooltip content="Options (export, import, etc.)">
              <Menu.Button className={buttonClassName}>
                <div ref={menuButtonRef}>
                  <IconDots className={iconClassName} />
                </div>
              </Menu.Button>
            </Tooltip>
            {open && (
              <Portal>
                <Menu.Items
                  ref={setPopperElement}
                  className="z-10 overflow-hidden bg-white rounded shadow-popover dark:bg-gray-800"
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
                        onClick={onImport}
                      >
                        <IconDownload size={18} className="mr-1" />
                        <span>Import</span>
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-gray-800 dark:text-gray-200 ${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                        onClick={onExportClick}
                      >
                        <IconUpload size={18} className="mr-1" />
                        <span>Export</span>
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex w-full items-center px-4 py-2 text-left text-gray-800 dark:text-gray-200 ${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                        onClick={onExportAllClick}
                      >
                        <IconCloudDownload size={18} className="mr-1" />
                        <span>Export All</span>
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
