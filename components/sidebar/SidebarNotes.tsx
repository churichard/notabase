import { Dispatch, memo, SetStateAction, useMemo } from 'react';
import { Notes, NoteTreeItem, useStore } from 'lib/store';
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

  const notes = useStore((state) => state.notes);
  const noteTree = useStore((state) => state.noteTree);
  const noteSort = useStore((state) => state.noteSort);
  const sortedNoteTree = useMemo(
    () => sortNoteTree(noteTree, notes, noteSort),
    [noteTree, notes, noteSort]
  );

  const numOfNotes = useMemo(() => Object.keys(notes).length, [notes]);

  return (
    <ErrorBoundary>
      <div className={`flex flex-col flex-1 overflow-x-hidden ${className}`}>
        {sortedNoteTree && sortedNoteTree.length > 0 ? (
          <SidebarNotesTree
            data={sortedNoteTree}
            className="flex-1 overflow-y-auto"
          />
        ) : (
          <p className="flex-1 px-6 my-2 text-center text-gray-500">
            No notes yet
          </p>
        )}
        <SidebarNotesFooter
          noteSort={noteSort}
          numOfNotes={numOfNotes}
          setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
        />
      </div>
    </ErrorBoundary>
  );
}

/**
 * Sorts the tree recursively based on the information in notes with the given noteSort.
 */
const sortNoteTree = (
  tree: NoteTreeItem[],
  notes: Notes,
  noteSort: Sort
): NoteTreeItem[] => {
  // Copy tree shallowly
  const newTree = [...tree];
  // Sort tree items (one level)
  newTree.sort((n1, n2) => {
    const note1 = notes[n1.id];
    const note2 = notes[n2.id];
    switch (noteSort) {
      case Sort.DateModifiedAscending:
        return dateCompare(note1.updated_at, note2.updated_at);
      case Sort.DateModifiedDescending:
        return dateCompare(note2.updated_at, note1.updated_at);
      case Sort.DateCreatedAscending:
        return dateCompare(note1.created_at, note2.created_at);
      case Sort.DateCreatedDescending:
        return dateCompare(note2.created_at, note1.created_at);
      case Sort.TitleAscending:
        return caseInsensitiveStringCompare(note1.title, note2.title);
      case Sort.TitleDescending:
        return caseInsensitiveStringCompare(note2.title, note1.title);
      default:
        return caseInsensitiveStringCompare(note1.title, note2.title);
    }
  });
  // Sort each tree item's children
  return newTree.map((item) => ({
    ...item,
    children: sortNoteTree(item.children, notes, noteSort),
  }));
};

export default memo(SidebarNotes);
