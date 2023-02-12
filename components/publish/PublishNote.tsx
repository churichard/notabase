import { memo, useMemo } from 'react';
import type { Path } from 'slate';
import ErrorBoundary from 'components/ErrorBoundary';
import NoteHeader from 'components/editor/NoteHeader';
import { PublishNote as PublishNoteType } from 'pages/publish/note/[id]';
import { ProvideCurrentNote } from 'utils/useCurrentNote';
import PublishEditor from './PublishEditor';
import PublishTitle from './PublishTitle';

type Props = {
  note: PublishNoteType;
  highlightedPath?: Path;
  className?: string;
};

function PublishNote(props: Props) {
  const { note, highlightedPath, className } = props;

  const currentNoteValue = useMemo(() => ({ id: note.id }), [note.id]);

  const noteContainerClassName =
    'flex flex-col flex-shrink-0 md:flex-shrink w-full bg-white dark:bg-gray-900 dark:text-gray-100';
  const errorContainerClassName = `${noteContainerClassName} items-center justify-center h-full p-4`;

  return (
    <ErrorBoundary
      fallback={
        <div className={errorContainerClassName}>
          <p>An unexpected error occurred when rendering this note.</p>
        </div>
      }
    >
      <ProvideCurrentNote value={currentNoteValue}>
        <div id={note.id} className={`${noteContainerClassName} ${className}`}>
          <NoteHeader />
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <div className="mx-auto flex w-full flex-1 flex-col md:w-128 lg:w-160 xl:w-192">
              <PublishTitle
                className="px-8 pt-8 pb-1 md:px-12 md:pt-12"
                title={note.title}
              />
              <PublishEditor
                className="flex-1 px-8 pt-2 pb-8 md:px-12 md:pb-12"
                note={note}
                highlightedPath={highlightedPath}
              />
            </div>
          </div>
        </div>
      </ProvideCurrentNote>
    </ErrorBoundary>
  );
}

export default memo(PublishNote);
