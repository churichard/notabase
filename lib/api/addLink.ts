import supabase from 'lib/supabase';
import { Link } from 'types/supabase';

export default async function addLink(
  userId: string,
  tailId: string,
  headId: string
) {
  const { data } = await supabase
    .from<Link>('links')
    .insert([
      {
        user_id: userId,
        tail: tailId,
        head: headId,
      },
    ])
    .single();

  return data;
}
