import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import type { Note } from 'types/supabase';
import AppLayout from 'components/AppLayout';
import type { Notes } from 'lib/store';

type Props = {
  initialNotes: Notes;
};

export default function AppHome(props: Props) {
  const { initialNotes } = props;
  return (
    <>
      <Head>
        <title>Notabase</title>
      </Head>
      <AppLayout initialNotes={initialNotes}>
        <div className="flex items-center justify-center w-full p-12">
          <p className="text-gray-500">Get started by adding a new note</p>
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
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
    .from<Note>('notes')
    .select('id, title, content')
    .eq('user_id', user.id)
    .order('title');

  // Redirect to first note if one exists
  // TODO: maybe we should redirect to the most recent note instead?
  if (notes && notes.length > 0) {
    return {
      props: {},
      redirect: { destination: `/app/note/${notes[0].id}`, permanent: false },
    };
  }

  return {
    props: {
      initialNotes:
        notes?.reduce<Record<Note['id'], Note>>((acc, note) => {
          acc[note.id] = note;
          return acc;
        }, {}) ?? {},
    },
  };
};
