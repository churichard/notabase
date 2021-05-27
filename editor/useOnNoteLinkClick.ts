import { createRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'utils/useAuth';
import { useCurrentNote } from 'utils/useCurrentNote';
import { useStore } from 'lib/store';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export default function useOnNoteLinkClick() {
  const { user } = useAuth();
  const router = useRouter();
  const currentNote = useCurrentNote();
  const openNotes = useStore((state) => state.openNotes);
  const setOpenNotes = useStore((state) => state.setOpenNotes);

  const onClick = useCallback(
    async (noteId: string) => {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: 'smooth',
        inline: 'center',
      };

      // If the note is already open, scroll it into view
      const openNote = openNotes.find(({ note }) => note.id === noteId);
      if (openNote) {
        openNote.ref.current?.scrollIntoView(scrollOptions);
        return;
      }

      // If the note is not open: fetch it, add it to the open notes, and scroll it into view
      const currentNoteIndex = openNotes.findIndex(
        ({ note }) => note.id === currentNote.id
      );
      if (currentNoteIndex < 0 || !user) {
        return;
      }

      const { data: stackedNote } = await supabase
        .from<Note>('notes')
        .select('id, title, content')
        .eq('id', noteId)
        .single();
      if (stackedNote) {
        // Update stack query param shallowly
        const stackedNoteIds: string[] = [];
        const stackQuery = router.query.stack;
        if (stackQuery) {
          if (typeof stackQuery === 'string') {
            stackedNoteIds.push(stackQuery);
          } else {
            stackedNoteIds.push(...stackQuery);
          }
        }
        // Replace the notes after the current note with the new note
        stackedNoteIds.splice(
          currentNoteIndex, // Stacked notes don't include the current note
          stackedNoteIds.length - currentNoteIndex,
          stackedNote.id
        );
        // Push stack query param into router
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, stack: stackedNoteIds },
          },
          undefined,
          { shallow: true }
        );

        // Add note to open notes and scroll it into view
        const ref = createRef<HTMLElement | null>();
        const newNote = { note: stackedNote, ref };
        setOpenNotes([newNote], currentNoteIndex + 1);
        ref.current?.scrollIntoView(scrollOptions);
      }
    },
    [user, router, currentNote.id, openNotes, setOpenNotes]
  );

  return onClick;
}
