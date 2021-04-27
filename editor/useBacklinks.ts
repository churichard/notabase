import { useCallback, useMemo } from 'react';
import { Descendant, Element, Node, Path, Text } from 'slate';
import produce from 'immer';
import { mutate } from 'swr';
import { ElementType } from 'types/slate';
import { Note } from 'types/supabase';
import useNotes, { NOTES_KEY } from 'lib/api/useNotes';
import supabase from 'lib/supabase';
import { useAuth } from 'utils/useAuth';

type Backlink = {
  id: string;
  title: string;
  matches: Array<{
    context: string;
    path: Path;
  }>;
};

export default function useBacklinks(noteId: string) {
  const { user } = useAuth();
  const { data: notes = [] } = useNotes();
  const backlinks = useMemo(() => getBacklinks(notes, noteId), [notes, noteId]);

  /**
   * Updates the link properties of the backlinks on each backlinked note when the
   * current note title has changed.
   */
  const updateBacklinks = useCallback(
    async (newTitle: string) => {
      if (!user) {
        return;
      }

      const updateData = [];
      for (const backlink of backlinks) {
        // Note: this can still result in a race condition if the content is updated elsewhere
        // after we get the note and before we update the backlinks.
        const { data: note } = await supabase
          .from<Note>('notes')
          .select('id, content')
          .eq('id', backlink.id)
          .single();

        if (!note) {
          continue;
        }

        let newBacklinkContent = note.content;
        for (const match of backlink.matches) {
          newBacklinkContent = produce(newBacklinkContent, (draftState) => {
            // Path should not be empty
            const path = match.path;
            if (path.length <= 0) {
              return;
            }

            // Get the node from the path
            let linkNode = draftState[path[0]];
            for (const pathNumber of path.slice(1)) {
              linkNode = (linkNode as Element).children[pathNumber];
            }

            // Assert that linkNode is a note link
            if (
              !Element.isElement(linkNode) ||
              linkNode.type !== ElementType.NoteLink
            ) {
              return;
            }

            // Update noteTitle property on the node
            linkNode.noteTitle = newTitle;

            // If isTextTitle is true, then the link text should always be equal to the note title
            if (linkNode.isTextTitle) {
              for (const linkNodeChild of linkNode.children) {
                linkNodeChild.text = newTitle;
              }
            }
          });
        }
        updateData.push({
          id: backlink.id,
          content: newBacklinkContent,
        });
      }

      // It would be better if we could consolidate the update requests into one request
      // See https://github.com/supabase/supabase-js/issues/156
      const promises = [];
      for (const data of updateData) {
        promises.push(
          supabase
            .from<Note>('notes')
            .update({ content: data.content })
            .eq('id', data.id)
        );
      }
      await Promise.all(promises);

      mutate(NOTES_KEY); // Make sure backlinks are updated
    },
    [user, backlinks]
  );

  return { backlinks, updateBacklinks };
}

/**
 * Searches the notes array for note links to the given noteId
 * and returns an array of the matches.
 */
const getBacklinks = (notes: Note[], noteId: string): Backlink[] => {
  const result: Backlink[] = [];
  for (const note of notes) {
    const matches = getBacklinkMatches(note.content, noteId);
    if (matches.length > 0) {
      result.push({
        id: note.id,
        title: note.title,
        matches,
      });
    }
  }
  return result;
};

const getBacklinkMatches = (nodes: Descendant[], noteId: string) => {
  const result: Backlink['matches'] = [];
  for (const [index, node] of nodes.entries()) {
    result.push(...getBacklinkMatchesHelper(node, noteId, [index]));
  }
  return result;
};

const getBacklinkMatchesHelper = (
  node: Descendant,
  noteId: string,
  path: Path
): Backlink['matches'] => {
  if (Text.isText(node)) {
    return [];
  }

  const result: Backlink['matches'] = [];
  const children = node.children;
  for (const [index, child] of children.entries()) {
    if (Element.isElement(child)) {
      if (
        child.type === ElementType.NoteLink &&
        child.noteId === noteId &&
        Node.string(child)
      ) {
        result.push({
          context: Node.string(node),
          path: [...path, index],
        });
      }
      result.push(...getBacklinkMatchesHelper(child, noteId, [...path, index]));
    }
  }

  return result;
};
