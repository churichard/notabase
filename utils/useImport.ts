import { useCallback } from 'react';
import unified from 'unified';
import markdown from 'remark-parse';
import { createEditor, Descendant, Editor, Element, Transforms } from 'slate';
import { toast } from 'react-toastify';
import wikiLinkPlugin from 'remark-wiki-link';
import { v4 as uuidv4 } from 'uuid';
import { store } from 'lib/store';
import upsertNote from 'lib/api/upsertNote';
import supabase from 'lib/supabase';
import remarkToSlate from 'editor/serialization/remarkToSlate';
import withLinks from 'editor/plugins/withLinks';
import { caseInsensitiveStringEqual } from 'utils/string';
import { ElementType } from 'types/slate';
import { Note } from 'types/supabase';
import { useAuth } from './useAuth';

export default function useImport() {
  const { user } = useAuth();

  const onImport = useCallback(() => {
    if (!user) {
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.text, .txt, .md, .mkdn, .mdwn, .mdown, .markdown';
    input.multiple = true;

    input.onchange = async (e) => {
      if (!e.target) {
        return;
      }

      const inputElement = e.target as HTMLInputElement;

      if (!inputElement.files) {
        return;
      }

      // Add a new note for each imported note
      const promises: Promise<Note | null>[] = [];
      for (const file of inputElement.files) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        const fileContent = await file.text();

        const { result } = unified()
          .use(markdown)
          .use(wikiLinkPlugin)
          .use(remarkToSlate)
          .processSync(fileContent);

        const { content: slateContent, promises: noteLinkPromises } =
          fixNoteLinks(result as Descendant[]);

        promises.push(...noteLinkPromises);
        promises.push(
          upsertNote({
            user_id: user.id,
            title: getUniqueTitle(fileName),
            content: slateContent.length > 0 ? slateContent : undefined,
          })
        );
      }

      const newNotes = await Promise.all(promises);

      // Show a toast with the number of successfully imported notes
      const numOfSuccessfulImports = newNotes.filter((note) => !!note).length;
      if (numOfSuccessfulImports > 1) {
        toast.success(
          `${numOfSuccessfulImports} notes were successfully imported.`
        );
      } else if (numOfSuccessfulImports === 1) {
        toast.success(
          `${numOfSuccessfulImports} note was successfully imported.`
        );
      } else {
        toast.error('No notes were imported.');
      }
    };

    input.click();
  }, [user]);

  return onImport;
}

// Get a unique title by appending a number after the given noteTitle.
const getUniqueTitle = (title: string) => {
  const getResult = () => (suffix > 0 ? `${title} ${suffix}` : title);

  let suffix = 0;
  const notesArr = Object.values(store.getState().notes);
  while (
    notesArr.findIndex((note) =>
      caseInsensitiveStringEqual(note.title, getResult())
    ) > -1
  ) {
    suffix += 1;
  }

  return getResult();
};

/**
 * Fixes note links by adding the proper note id to the link.
 * The note id comes from an existing note, or a new note is created.
 */
const fixNoteLinks = (
  content: Descendant[]
): { content: Descendant[]; promises: Promise<Note | null>[] } => {
  const promises = [];

  const editor = withLinks(createEditor());
  editor.children = content;

  // Find note link elements
  const matchingElements = Editor.nodes(editor, {
    at: [],
    match: (n) => Element.isElement(n) && n.type === ElementType.NoteLink,
  });

  const newNoteTitleToId: Record<string, string | undefined> = {};
  const notesArr = Object.values(store.getState().notes);
  for (const [node, path] of matchingElements) {
    if (Element.isElement(node) && node.type === ElementType.NoteLink) {
      const noteTitle = node.noteTitle;
      let noteId;

      const existingNoteId =
        newNoteTitleToId[noteTitle] ??
        notesArr.find((note) =>
          caseInsensitiveStringEqual(note.title, noteTitle)
        )?.id;

      if (existingNoteId) {
        noteId = existingNoteId;
      } else {
        noteId = uuidv4(); // Create new note id
        newNoteTitleToId[noteTitle] = noteId; // Add to new notes array

        const userId = supabase.auth.user()?.id;
        if (userId) {
          promises.push(
            upsertNote({ id: noteId, user_id: userId, title: noteTitle })
          );
        }
      }

      // Set proper note id on the note link
      Transforms.setNodes(
        editor,
        { noteId },
        {
          at: path,
          match: (n) =>
            Element.isElement(n) &&
            n.type === ElementType.NoteLink &&
            n.noteTitle === noteTitle,
        }
      );
    }
  }

  return { content: editor.children, promises };
};
