import type { PickPartial } from 'types/utils';
import supabase from 'lib/supabase';
import type { Note } from 'types/supabase';
import { store } from 'lib/store';
import {
  hasInlineImageData,
  INLINE_IMAGE_DB_ERROR,
  NOTE_SIZE_ERROR_CODE,
} from 'lib/noteContent';

export type NoteUpdate = PickPartial<
  Note,
  'user_id' | 'content' | 'title' | 'created_at' | 'updated_at' | 'visibility'
>;

export default async function updateNote(note: NoteUpdate) {
  // The size limit is deliberately left to the database trigger, which allows
  // grandfathered oversized notes to shrink back under the limit
  if (note.content && hasInlineImageData(note.content)) {
    return {
      data: null,
      error: { code: NOTE_SIZE_ERROR_CODE, message: INLINE_IMAGE_DB_ERROR },
    };
  }
  const response = await supabase
    .from('notes')
    .update({ ...note, updated_at: new Date().toISOString() })
    .eq('id', note.id)
    .select('id, updated_at, visibility')
    .single();

  if (response.data) {
    // Update certain properties locally
    store.getState().updateNote({
      id: note.id,
      updated_at: response.data.updated_at,
      visibility: response.data.visibility,
    });
  }

  return response;
}
