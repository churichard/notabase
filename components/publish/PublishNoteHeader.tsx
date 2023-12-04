import { IconX } from '@tabler/icons';
import { useStore } from 'lib/store';
import Tooltip from 'components/Tooltip';
import useOnClosePane from 'utils/useOnClosePane';

export default function PublishNoteHeader() {
  const isCloseButtonVisible = useStore(
    (state) => state.openNoteIds.length > 1
  );

  const onClosePane = useOnClosePane();

  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  return (
    <div className="flex w-full items-center justify-end px-4 py-1 text-right">
      {isCloseButtonVisible ? (
        <Tooltip content="Close pane">
          <button
            className={buttonClassName}
            onClick={onClosePane}
            title="Close pane"
          >
            <span className="flex h-8 w-8 items-center justify-center">
              <IconX className={iconClassName} />
            </span>
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}
