import { Dispatch, memo, SetStateAction, useMemo } from 'react';
import { NoteTreeItem, shallowEqual, useStore } from 'lib/store';
import { Sort } from 'lib/createUserSettingsSlice';
import { caseInsensitiveStringCompare } from 'utils/string';
import { dateCompare } from 'utils/date';
import ErrorBoundary from '../ErrorBoundary';
import SidebarNotesFooter from './SidebarNotesFooter';
import SidebarNotesTree from './SidebarNotesTree';

type SidebarNotesProps = {
  className?: string;
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
};

function SidebarNotes(props: SidebarNotesProps) {
  const { className, setIsFindOrCreateModalOpen } = props;

  const notes = useStore((state) => Object.values(state.notes), shallowEqual);
  const noteSort = useStore((state) => state.noteSort);
  const sortedNotes = useMemo(
    () =>
      notes.sort((n1, n2) => {
        switch (noteSort) {
          case Sort.DateModifiedAscending:
            return dateCompare(n1.updated_at, n2.updated_at);
          case Sort.DateModifiedDescending:
            return dateCompare(n2.updated_at, n1.updated_at);
          case Sort.DateCreatedAscending:
            return dateCompare(n1.created_at, n2.created_at);
          case Sort.DateCreatedDescending:
            return dateCompare(n2.created_at, n1.created_at);
          case Sort.TitleAscending:
            return caseInsensitiveStringCompare(n1.title, n2.title);
          case Sort.TitleDescending:
            return caseInsensitiveStringCompare(n2.title, n1.title);
          default:
            return caseInsensitiveStringCompare(n1.title, n2.title);
        }
      }),
    [notes, noteSort]
  );

  const treeData: NoteTreeItem[] = useMemo(
    () => sortedNotes.map((note) => ({ id: note.id, children: [] })), // TODO: Fill in children
    [sortedNotes]
  );

  return (
    <ErrorBoundary>
      <div className={`flex flex-col flex-1 overflow-x-hidden ${className}`}>
        {sortedNotes && sortedNotes.length > 0 ? (
          <SidebarNotesTree
            data={treeData}
            className="flex-1 overflow-y-auto"
          />
        ) : (
          <p className="flex-1 px-6 my-2 text-center text-gray-500">
            No notes yet
          </p>
        )}
        <SidebarNotesFooter
          noteSort={noteSort}
          numOfNotes={notes.length}
          setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
        />
      </div>
    </ErrorBoundary>
  );
}

export default memo(SidebarNotes);
