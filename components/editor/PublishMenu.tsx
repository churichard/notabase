import { useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import { IconCircleCheck, IconCloudUpload } from '@tabler/icons';
import { usePopper } from 'react-popper';
import Portal from 'components/Portal';
import Tooltip from 'components/Tooltip';
import { useCurrentNote } from 'utils/useCurrentNote';
import updateNote from 'lib/api/updateNote';
import { Visibility } from 'types/supabase';
import { useStore } from 'lib/store';
import { useAuth } from 'utils/useAuth';

export default function PublishMenu() {
  const currentNote = useCurrentNote();
  const { user } = useAuth();

  const isNotePrivate = useStore(
    (state) => state.notes[currentNote.id].visibility === Visibility.Private
  );

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    popperElement,
    { placement: 'bottom-start' }
  );

  const onPublishClick = useCallback(async () => {
    await updateNote({ id: currentNote.id, visibility: Visibility.Public });
  }, [currentNote.id]);

  const onUnpublishClick = useCallback(async () => {
    await updateNote({ id: currentNote.id, visibility: Visibility.Private });
  }, [currentNote.id]);

  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            ref={menuButtonRef}
            className={buttonClassName}
            title="Options (export, import, etc.)"
            data-testid="note-menu-button"
          >
            <Tooltip content="Options (export, import, etc.)">
              <span className="flex items-center py-1 px-2">
                <IconCloudUpload size={20} className={iconClassName} />
                <span className="ml-1">Publish</span>
              </span>
            </Tooltip>
          </Menu.Button>
          {open && (
            <Portal>
              <Menu.Items
                ref={setPopperElement}
                data-testid="note-menu-button-dropdown"
                className="z-10 w-128 overflow-hidden rounded bg-white p-6 shadow-popover focus:outline-none dark:bg-gray-800"
                static
                style={styles.popper}
                {...attributes.popper}
              >
                {isNotePrivate ? (
                  <div className="dark:text-white">
                    <h1 className="text-center font-medium">
                      Publish to the web
                    </h1>
                    <p className="mt-4 text-sm">
                      Publish a read-only version of this note to the web. It
                      will be publicly accessible by anyone with the link.
                    </p>
                    <button
                      className="btn mt-4 block w-full px-4 py-2 text-center"
                      onClick={onPublishClick}
                    >
                      Publish to web
                    </button>
                  </div>
                ) : (
                  <div className="dark:text-white">
                    <h1 className="text-center font-medium">
                      Publish to the web
                    </h1>
                    <p className="mt-4 flex items-center text-sm">
                      <IconCircleCheck size={20} className="text-primary-500" />
                      <span className="ml-1">
                        This page is live on the web.
                      </span>
                    </p>
                    <input
                      type="text"
                      className="mt-4 block w-full rounded border-gray-300 text-sm focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
                      value={`${window.location.protocol}//${window.location.host}/publish/${user?.id}/note/${currentNote.id}`}
                      disabled
                    />
                    <button
                      className="btn-secondary mt-4 px-4 py-1 text-center"
                      onClick={onUnpublishClick}
                    >
                      Unpublish
                    </button>
                  </div>
                )}
              </Menu.Items>
            </Portal>
          )}
        </>
      )}
    </Menu>
  );
}
