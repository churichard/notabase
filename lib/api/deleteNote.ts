import * as Sentry from '@sentry/nextjs';
import { store } from 'lib/store';
import supabase from 'lib/supabase';
import { getUserAssetPaths } from 'lib/storage/userAssets';

export default async function deleteNote(userId: string, noteId: string) {
  const noteAssetPaths = await getNoteAssetPaths(userId, noteId);

  // Update note titles in sidebar
  store.getState().deleteNote(noteId);

  const response = await supabase.from('notes').delete().eq('id', noteId);

  if (!response.error && noteAssetPaths.length > 0) {
    const referencedAssetPaths = await getReferencedAssetPaths(userId);
    if (referencedAssetPaths) {
      const assetPathsToDelete = noteAssetPaths.filter(
        (path) => !referencedAssetPaths.has(path)
      );

      if (assetPathsToDelete.length > 0) {
        const { error: removeError } = await supabase.storage
          .from('user-assets')
          .remove(assetPathsToDelete);
        if (removeError) {
          Sentry.captureException(removeError);
        }
      }
    }
  }

  await supabase
    .from('users')
    .update({ note_tree: store.getState().noteTree })
    .eq('id', userId);

  return response;
}

/**
 * Returns the asset paths referenced by the given note. The local store can
 * contain edits that have not reached the database yet, so both sources are
 * checked before the note is deleted.
 */
const getNoteAssetPaths = async (userId: string, noteId: string) => {
  const { data: dbNotes, error } = await supabase
    .from('notes')
    .select('id, content')
    .eq('id', noteId);

  if (error || !dbNotes) {
    // If references can't be verified, leave the files alone
    return [];
  }

  const allNotes = [...Object.values(store.getState().notes), ...dbNotes];
  return [
    ...new Set(
      allNotes
        .filter((note) => note.id === noteId)
        .flatMap((note) => getUserAssetPaths(note.content, userId))
    ),
  ];
};

/**
 * Returns the assets referenced after the note has been deleted. Fetching the
 * database again catches references saved by another device during deletion.
 */
const getReferencedAssetPaths = async (userId: string) => {
  const { data: dbNotes, error } = await supabase
    .from('notes')
    .select('id, content')
    .eq('user_id', userId);

  if (error || !dbNotes) {
    // If references can't be verified, leave the files alone
    return null;
  }

  const allNotes = [...Object.values(store.getState().notes), ...dbNotes];
  return new Set(
    allNotes.flatMap((note) => getUserAssetPaths(note.content, userId))
  );
};
