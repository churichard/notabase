import { createRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { useAuth } from 'utils/useAuth';
import { useCurrentNote } from 'utils/useCurrentNote';
import { openNotesAtom } from 'lib/state';
import supabase from 'lib/supabase';
import { Note } from 'types/supabase';

export default function useOnNoteLinkClick(noteId: string) {
  const { user } = useAuth();
  const router = useRouter();
  const currentNote = useCurrentNote();
  const [openNotes, setOpenNotes] = useAtom(openNotesAtom);

  const onClick = useCallback(async () => {
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
      await setOpenNotes((notes) => {
        const newNotes = [...notes];
        // Replace the notes after the current note with the new note
        newNotes.splice(currentNoteIndex + 1, notes.length - currentNoteIndex, {
          note: stackedNote,
          ref,
        });
        return newNotes;
      });
      ref.current?.scrollIntoView(scrollOptions);
    }
  }, [user, router, noteId, currentNote.id, openNotes, setOpenNotes]);

  return onClick;
}
