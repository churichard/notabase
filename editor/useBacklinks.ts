import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Descendant, Path } from 'slate';
import { createEditor, Editor, Element, Node, Transforms } from 'slate';
import produce from 'immer';
import { ElementType } from 'types/slate';
import type { Note } from 'types/supabase';
import supabase from 'lib/supabase';
import usePrevious from 'utils/usePrevious';
import type { Notes } from 'lib/store';
import { store, useStore, deepIsEqual } from 'lib/store';
import useDebounce from 'utils/useDebounce';

const DEBOUNCE_MS = 1000;

export type Backlink = {
  id: string;
  title: string;
  matches: Array<{
    context: string;
    path: Path;
  }>;
};

type ReturnType = {
  linkedBacklinks: Backlink[];
  unlinkedBacklinks: Backlink[];
  updateBacklinks: (newTitle: string) => Promise<void>;
  deleteBacklinks: () => Promise<void>;
};

export default function useBacklinks(noteId: string) {
  const notes = useDebounce(
    useStore((state) => state.notes, deepIsEqual),
    DEBOUNCE_MS
  );

  const { getLinkedBacklinks, getUnlinkedBacklinks } = useBacklinksCache(
    notes,
    noteId
  );

  const state = useMemo(() => {
    const state = {
      updateBacklinks: (newTitle: string) =>
        updateBacklinks(newTitle, noteId, getLinkedBacklinks()),
      deleteBacklinks: () => deleteBacklinks(noteId, getLinkedBacklinks()),
    };
    // Backlinks are not computed until they are retrieved
    Object.defineProperties(state, {
      linkedBacklinks: {
        get: getLinkedBacklinks,
        enumerable: true,
      },
      unlinkedBacklinks: {
        get: getUnlinkedBacklinks,
        enumerable: true,
      },
    });
    return state as ReturnType;
  }, [noteId, getLinkedBacklinks, getUnlinkedBacklinks]);

  return state;
}

type BacklinkCache = {
  backlinks: Backlink[];
  shouldRecompute: boolean;
};

function useBacklinksCache(notes: Notes, noteId: string) {
  const linkedCache = useRef<BacklinkCache>({
    backlinks: [],
    shouldRecompute: true,
  });
  const unlinkedCache = useRef<BacklinkCache>({
    backlinks: [],
    shouldRecompute: true,
  });

  const previousNotes = usePrevious(notes);
  const previousNoteId = usePrevious(noteId);

  useEffect(() => {
    // Only recompute backlinks if the props have changed
    if (previousNotes !== notes || previousNoteId !== noteId) {
      linkedCache.current.shouldRecompute = true;
      unlinkedCache.current.shouldRecompute = true;
    }
  }, [notes, noteId, previousNotes, previousNoteId]);

  const getBacklinks = useCallback(
    (cache: BacklinkCache, compute: () => Backlink[]) => {
      if (cache.backlinks && !cache.shouldRecompute) {
        return cache.backlinks;
      }
      cache.backlinks = compute();
      cache.shouldRecompute = false;
      return cache.backlinks;
    },
    []
  );

  return {
    getLinkedBacklinks: () =>
      getBacklinks(linkedCache.current, () =>
        computeLinkedBacklinks(notes, noteId)
      ),
    getUnlinkedBacklinks: () =>
      getBacklinks(unlinkedCache.current, () =>
        computeUnlinkedBacklinks(notes, notes[noteId].title)
      ),
  };
}

/**
 * Searches the notes array for note links to the given noteId
 * and returns an array of the matches.
 */
const computeLinkedBacklinks = (notes: Notes, noteId: string): Backlink[] => {
  const result: Backlink[] = [];
  for (const note of Object.values(notes)) {
    const matches = computeLinkedMatches(note.content, noteId);
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

/**
 * Searches the notes array for text matches to the given noteTitle
 * and returns an array of the matches.
 */
const computeUnlinkedBacklinks = (
  notes: Notes,
  noteTitle: string | undefined
): Backlink[] => {
  if (!noteTitle) {
    return [];
  }

  const result: Backlink[] = [];
  for (const note of Object.values(notes)) {
    if (note.title === noteTitle) {
      // We skip getting unlinked backlinks if the note titles are the same
      continue;
    }
    const matches = computeUnlinkedMatches(note.content, noteTitle);
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

const computeLinkedMatches = (nodes: Descendant[], noteId: string) => {
  const editor = createEditor();
  editor.children = nodes;

  // Find note link elements that match noteId
  const matchingElements = Editor.nodes(editor, {
    at: [],
    match: (n) =>
      Element.isElement(n) &&
      n.type === ElementType.NoteLink &&
      n.noteId === noteId &&
      !!Node.string(n), // We ignore note links with empty link text
  });

  const result: Backlink['matches'] = [];
  for (const [, path] of matchingElements) {
    const parent = Node.parent(editor, path);
    result.push({ context: Node.string(parent), path });
  }
  return result;
};

const computeUnlinkedMatches = (nodes: Descendant[], noteTitle: string) => {
  const editor = createEditor();
  editor.children = nodes;

  // Remove note links
  Transforms.removeNodes(editor, {
    at: [],
    match: (n) => Element.isElement(n) && n.type === ElementType.NoteLink,
  });

  // Find elements that have noteTitle in them
  const matchingElements = Editor.nodes(editor, {
    at: [],
    mode: 'lowest',
    match: (n) =>
      Element.isElement(n) &&
      Node.string(n).toLowerCase().includes(noteTitle.toLowerCase()),
  });

  const result: Backlink['matches'] = [];
  for (const [node, path] of matchingElements) {
    result.push({ context: Node.string(node), path });
  }
  return result;
};

/**
 * Updates the link properties of the backlinks on each backlinked note when the
 * current note title has changed.
 */
const updateBacklinks = async (
  newTitle: string,
  noteId: string,
  backlinks: Backlink[]
) => {
  const updateData: Pick<Note, 'id' | 'content'>[] = [];
  for (const backlink of backlinks) {
    // TODO: this can still result in a race condition if the content is updated elsewhere
    // after we get the note and before we update the backlinks.
    const { data: note } = await supabase
      .from<Note>('notes')
      .select('id, content')
      .eq('id', backlink.id)
      .single();

    if (!note) {
      continue;
    }

    const matches = computeLinkedMatches(note.content, noteId); // Compute matches for the db note
    let newBacklinkContent = note.content;
    for (const match of matches) {
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

  // Make sure backlinks are updated locally
  for (const newNote of updateData) {
    store.getState().updateNote(newNote);
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
};

/**
 * Deletes the backlinks on each backlinked note and replaces them with the link text.
 */
const deleteBacklinks = async (noteId: string, backlinks: Backlink[]) => {
  const updateData: Pick<Note, 'id' | 'content'>[] = [];
  for (const backlink of backlinks) {
    // TODO: this can still result in a race condition if the content is updated elsewhere
    // after we get the note and before we update the backlinks.
    const { data: note } = await supabase
      .from<Note>('notes')
      .select('id, content')
      .eq('id', backlink.id)
      .single();

    if (!note) {
      continue;
    }

    const editor = createEditor();
    editor.children = note.content;

    Transforms.unwrapNodes(editor, {
      at: [],
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        n.type === ElementType.NoteLink &&
        n.noteId === noteId,
    });

    updateData.push({
      id: backlink.id,
      content: editor.children,
    });
  }

  // Make sure backlinks are updated locally
  for (const newNote of updateData) {
    store.getState().updateNote(newNote);
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
};
