import { useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconAlertCircle,
  IconArrowUpCircle,
  IconCircleCheck,
  IconWorldUpload,
} from '@tabler/icons';
import { usePopper } from 'react-popper';
import Portal from 'components/Portal';
import { useCurrentNote } from 'utils/useCurrentNote';
import updateNote from 'lib/api/updateNote';
import { Visibility } from 'types/supabase';
import { useStore } from 'lib/store';
import { useAuth } from 'utils/useAuth';
import useFeature from 'utils/useFeature';
import { Feature } from 'constants/pricing';
import Tooltip from 'components/Tooltip';

export default function PublishMenu() {
  const currentNote = useCurrentNote();
  const { user } = useAuth();

  const isNotePrivate = useStore(
    (state) => state.notes[currentNote.id].visibility === Visibility.Private
  );

  const hasPublishingFeature = useFeature(Feature.NumOfNotes);

  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
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
    if (hasPublishingFeature) {
      await updateNote({ id: currentNote.id, visibility: Visibility.Public });
    } else {
      setIsUpgradeModalOpen(true);
    }
  }, [currentNote.id, hasPublishingFeature, setIsUpgradeModalOpen]);

  const onUnpublishClick = useCallback(async () => {
    await updateNote({ id: currentNote.id, visibility: Visibility.Private });
  }, [currentNote.id]);

  const publicUrl = `${window.location.protocol}//${window.location.host}/publish/${user?.id}/note/${currentNote.id}`;

  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  let publishButton: JSX.Element;
  if (isNotePrivate) {
    publishButton = (
      <>
        <IconWorldUpload size={20} className={iconClassName} />
        <span className="ml-1">Publish</span>
      </>
    );
  } else if (hasPublishingFeature) {
    publishButton = (
      <>
        <IconCircleCheck
          size={20}
          className="text-primary-600 dark:text-primary-300"
        />
        <span className="ml-1">Live</span>
      </>
    );
  } else {
    publishButton = (
      <>
        <IconAlertCircle
          size={20}
          className="text-yellow-600 dark:text-yellow-300"
        />
        <span className="ml-1">Not Live</span>
      </>
    );
  }

  let menuContent: JSX.Element;
  if (isNotePrivate) {
    menuContent = (
      <div className="dark:text-white">
        <h1 className="text-center font-medium">Publish to the web</h1>
        <p className="mt-4 text-sm">
          Publish a read-only version of this note to the web. It will be
          publicly accessible by anyone with the link.
        </p>
        <Tooltip
          content="Get Notabase Pro to publish your notes on the web."
          disabled={hasPublishingFeature}
        >
          <button
            className="btn mt-4 flex w-full items-center justify-center px-4 py-2"
            onClick={onPublishClick}
          >
            {!hasPublishingFeature && (
              <IconArrowUpCircle size={18} className="mr-1 flex-shrink-0" />
            )}
            {!hasPublishingFeature ? 'Upgrade to publish' : 'Publish to web'}
          </button>
        </Tooltip>
      </div>
    );
  } else if (hasPublishingFeature) {
    menuContent = (
      <div className="dark:text-white">
        <h1 className="text-center font-medium">Publish to the web</h1>
        <p className="mt-4 flex items-center text-sm">
          <IconCircleCheck
            size={20}
            className="text-primary-600 dark:text-primary-300"
          />
          <span className="ml-1">
            This page is live on the web. Share it with anyone!
          </span>
        </p>
        <input
          type="text"
          className="mt-4 block w-full rounded border-gray-300 text-sm focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
          value={publicUrl}
          disabled
        />
        <div className="mt-4 flex items-center">
          <button
            className="btn-secondary w-full px-4 py-1 text-center"
            onClick={onUnpublishClick}
          >
            Unpublish
          </button>
          <a
            className="btn ml-2 w-full px-4 py-1 text-center"
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View site
          </a>
        </div>
      </div>
    );
  } else {
    menuContent = (
      <div className="dark:text-white">
        <h1 className="text-center font-medium">Publish to the web</h1>
        <p className="mt-4 flex items-center text-sm">
          <IconAlertCircle
            size={20}
            className="flex-shrink-0 text-yellow-600 dark:text-yellow-300"
          />
          <span className="ml-2">
            You don&apos;t have an active Notabase Pro subscription, so this
            note is{' '}
            <span className="font-medium">not live on the web anymore</span>.
            Please{' '}
            <button
              className="link"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              renew your subscription
            </button>{' '}
            to fix this.
          </span>
        </p>
      </div>
    );
  }

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            ref={menuButtonRef}
            className={buttonClassName}
            data-testid="publish-menu-button"
          >
            <span className="flex items-center py-1 px-2">{publishButton}</span>
          </Menu.Button>
          {open && (
            <Portal>
              <Menu.Items
                ref={setPopperElement}
                data-testid="publish-menu"
                className="z-10 w-128 overflow-hidden rounded bg-white p-6 shadow-popover focus:outline-none dark:bg-gray-800"
                static
                style={styles.popper}
                {...attributes.popper}
              >
                {menuContent}
              </Menu.Items>
            </Portal>
          )}
        </>
      )}
    </Menu>
  );
}
