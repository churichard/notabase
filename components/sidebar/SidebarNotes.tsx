import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from 'react';
import { useVirtual } from 'react-virtual';
import { shallowEqual, useStore } from 'lib/store';
import { Sort } from 'lib/createUserSettingsSlice';
import { caseInsensitiveStringCompare } from 'utils/string';
import { dateCompare } from 'utils/date';
import ErrorBoundary from '../ErrorBoundary';
import { SidebarNoteLink } from './SidebarNoteLink';
import SidebarNotesFooter from './SidebarNotesFooter';

type SidebarNotesProps = {
  currentNoteId?: string;
  className?: string;
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
};

export default function SidebarNotes(props: SidebarNotesProps) {
  const { currentNoteId, className, setIsFindOrCreateModalOpen } = props;

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

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtual({
    size: sortedNotes.length,
    parentRef,
    estimateSize: useCallback(() => 32, []),
  });

  return (
    <ErrorBoundary>
      <div className={`flex flex-col flex-1 overflow-x-hidden ${className}`}>
        <div ref={parentRef} className="flex-1 overflow-y-auto">
          {sortedNotes && sortedNotes.length > 0 ? (
            <div
              style={{
                height: `${rowVirtualizer.totalSize}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.virtualItems.map((virtualRow) => {
                const note = sortedNotes[virtualRow.index];
                return (
                  <SidebarNoteLink
                    key={note.id}
                    note={note}
                    isHighlighted={note.id === currentNoteId}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="px-6 my-2 text-center text-gray-500">No notes yet</p>
          )}
        </div>
        <SidebarNotesFooter
          noteSort={noteSort}
          numOfNotes={notes.length}
          setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
        />
      </div>
    </ErrorBoundary>
  );
}
