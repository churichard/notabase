import type { MutableRefObject } from 'react';
import React, { createRef, useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AppLayout from 'components/AppLayout';
import Note from 'components/Note';
import type { Note as NoteType } from 'types/supabase';
import { useStore } from 'lib/store';

type OpenNoteWithContent = {
  note: NoteType;
  ref: MutableRefObject<HTMLElement | null>;
};

type Props = {
  initialNotes: Array<NoteType>;
  mainNote: NoteType | null;
  initialStackedNotes: Array<NoteType> | null;
};

export default function NotePage(props: Props) {
  const { initialNotes, mainNote, initialStackedNotes } = props;
  const openNotes = useStore((state) =>
    state.openNotes
      .map((openNote) => ({
        note: state.notes.find((note) => note.id === openNote.id),
        ref: openNote.ref,
      }))
      .filter((openNote): openNote is OpenNoteWithContent => !!openNote.note)
  );
  const setOpenNotes = useStore((state) => state.setOpenNotes);
  const updateNote = useStore((state) => state.updateNote);

  useEffect(() => {
    const openNotes = [];
    if (mainNote) {
      openNotes.push({
        id: mainNote.id,
        ref: createRef<HTMLElement | null>(),
      });
    }
    if (initialStackedNotes) {
      openNotes.push(
        ...initialStackedNotes.map((note) => ({
          id: note.id,
          ref: createRef<HTMLElement | null>(),
        }))
      );
    }
    setOpenNotes(openNotes);
  }, [setOpenNotes, mainNote, initialStackedNotes]);

  if (!mainNote) {
    return (
      <>
        <Head>
          <title>Notabase</title>
        </Head>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-2xl">
            Whoops&mdash;it doesn&apos;t look like this note exists!
          </p>
          <Link href="/app">
            <a className="mt-6 btn">Go back to my notes</a>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{mainNote.title}</title>
      </Head>
      <AppLayout initialNotes={initialNotes}>
        <div className="flex overflow-x-auto divide-x">
          {openNotes.length > 0
            ? openNotes.map(({ note, ref }) => (
                <Note
                  key={note.id}
                  ref={(node) => (ref.current = node)}
                  currentNote={note}
                  setCurrentNote={updateNote}
                />
              ))
            : null}
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  query,
}) => {
  // Create admin supabase client on server
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_KEY ?? ''
  );

  // Get authed user
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { destination: '/login', permanent: false } };
  }

  // Get notes from database
  const { data: notes } = await supabase
    .from<NoteType>('notes')
    .select('id, title, content')
    .eq('user_id', user.id)
    .order('title');

  // Validate id query param
  const noteId = query.id;
  if (!noteId || typeof noteId !== 'string') {
    return {
      props: {
        initialNotes: notes ?? [],
        mainNote: null,
        initialStackedNotes: null,
      },
    };
  }

  // Get the main note
  const mainNote = notes?.find((note) => note.id === noteId) ?? null;

  // Get stacked notes
  const stackQuery = query.stack;
  let stackedNotes: NoteType[] | null = null;
  if (stackQuery) {
    const stackedNoteIds: string[] = [];
    if (typeof stackQuery === 'string') {
      stackedNoteIds.push(stackQuery);
    } else {
      stackedNoteIds.push(...stackQuery);
    }

    stackedNotes = stackedNoteIds
      .map((noteId) => notes?.find((note) => note.id === noteId))
      .filter((note): note is NoteType => !!note); // can't use filter(Boolean) because of https://github.com/microsoft/TypeScript/issues/16655
  }

  return {
    props: {
      initialNotes: notes ?? [],
      mainNote,
      initialStackedNotes: stackedNotes,
    },
  };
};
