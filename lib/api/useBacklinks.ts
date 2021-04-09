import useSWR, { SWRConfiguration } from 'swr';
import { Descendant } from 'slate';
import supabase from 'lib/supabase';

type Backlink = {
  id: string;
  user_id: string;
  head: string;
  tail: {
    id: string;
    title: string;
    content: Descendant[];
  };
};

export const BACKLINKS_KEY = (noteId: string) => ['api/backlinks', noteId];

export default function useBacklinks(
  noteId: string,
  options?: SWRConfiguration
) {
  return useSWR<Array<Backlink>>(
    BACKLINKS_KEY(noteId),
    (_, noteId: string) => getBacklinks(noteId),
    options
  );
}

const getBacklinks = async (noteId: string) => {
  const { data } = await supabase
    .from<Backlink>('links')
    .select('id, tail (id, title, content)')
    .eq('head', noteId);
  return data ?? [];
};
