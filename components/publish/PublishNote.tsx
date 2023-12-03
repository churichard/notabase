import { memo, useMemo } from 'react';
import type { Path } from 'slate';
import ErrorBoundary from 'components/ErrorBoundary';
import { ProvideCurrentNote } from 'utils/useCurrentNote';
import { store } from 'lib/store';
import STRINGS from 'constants/strings';
import PublishEditor from './PublishEditor';
import PublishTitle from './PublishTitle';
import PublishNoteHeader from './PublishNoteHeader';

type Props = {
  noteId: string;
  highlightedPath?: Path;
  className?: string;
};

function PublishNote(props: Props) {
  const { noteId, highlightedPath, className } = props;

  const currentNoteValue = useMemo(() => ({ id: noteId }), [noteId]);

  const noteContainerClassName =
    'flex flex-col flex-shrink-0 md:flex-shrink w-full bg-white dark:bg-gray-900 dark:text-gray-100';
  const errorContainerClassName = `${noteContainerClassName} items-center justify-center h-full p-4`;

  const noteExists = !!store.getState().notes[noteId];

  return (
    <ErrorBoundary
      fallback={
        <div className={errorContainerClassName}>
          <p>An unexpected error occurred when rendering this note.</p>
        </div>
      }
    >
      <ProvideCurrentNote value={currentNoteValue}>
        <div id={noteId} className={`${noteContainerClassName} ${className}`}>
          <PublishNoteHeader />
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <div className="mx-auto flex w-full flex-1 flex-col md:w-128 lg:w-160 xl:w-192">
              {noteExists ? (
                <>
                  <PublishTitle
                    className="px-8 pt-8 pb-1 md:px-12 md:pt-12"
                    noteId={noteId}
                  />
                  <PublishEditor
                    className="flex-1 px-8 pt-2 pb-8 md:px-12 md:pb-12"
                    noteId={noteId}
                    highlightedPath={highlightedPath}
                  />
                </>
              ) : (
                <div className={errorContainerClassName}>
                  <p className="mt-6 text-center text-2xl">
                    {STRINGS.error.notePermissionError}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ProvideCurrentNote>
    </ErrorBoundary>
  );
}

export default memo(PublishNote);
