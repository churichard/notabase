import { Note } from 'types/supabase';

type Props = {
  note: Note;
};

export default function NoteMetadata(props: Props) {
  const { note } = props;
  return (
    <div className="space-y-1 border-t px-4 py-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400">
      <p>Last modified at {getReadableDatetime(note.updated_at)}</p>
      <p>Created at {getReadableDatetime(note.created_at)}</p>
    </div>
  );
}

const getReadableDatetime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};
