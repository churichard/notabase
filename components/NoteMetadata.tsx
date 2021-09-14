import { Note } from 'types/supabase';

type Props = {
  note: Note;
};

export default function NoteMetadata(props: Props) {
  const { note } = props;
  return (
    <div className="px-4 py-2 space-y-1 text-xs text-gray-600 border-t dark:border-gray-700 dark:text-gray-400">
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
