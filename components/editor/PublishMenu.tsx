import { useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconWorldUpload,
} from '@tabler/icons';
import { usePopper } from 'react-popper';
import Portal from 'components/Portal';
import { useCurrentNote } from 'utils/useCurrentNote';
import { Visibility } from 'types/supabase';
import { useStore } from 'lib/store';
import useFeature from 'utils/useFeature';
import { Feature } from 'constants/pricing';
import PublishMenuContent from './PublishMenuContent';

export default function PublishMenu() {
  const currentNote = useCurrentNote();

  const isNotePrivate = useStore(
    (state) => state.notes[currentNote.id].visibility === Visibility.Private
  );

  const hasPublishingFeature = useFeature(Feature.Publish);

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    popperElement,
    { placement: 'bottom-start' }
  );

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
                <PublishMenuContent
                  hasPublishingFeature={hasPublishingFeature}
                  noteId={currentNote.id}
                  isNotePrivate={isNotePrivate}
                />
              </Menu.Items>
            </Portal>
          )}
        </>
      )}
    </Menu>
  );
}
