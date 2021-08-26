import { useCallback } from 'react';
import unified from 'unified';
import markdown from 'remark-parse';
import { createEditor, Descendant, Editor, Element, Transforms } from 'slate';
import { toast } from 'react-toastify';
import wikiLinkPlugin from 'remark-wiki-link';
import { v4 as uuidv4 } from 'uuid';
import { store, useStore } from 'lib/store';
import upsertNote from 'lib/api/upsertNote';
import supabase from 'lib/supabase';
import remarkToSlate from 'editor/serialization/remarkToSlate';
import withLinks from 'editor/plugins/withLinks';
import withVoidElements from 'editor/plugins/withVoidElements';
import { caseInsensitiveStringEqual } from 'utils/string';
import { ElementType, NoteLink } from 'types/slate';
import { Note } from 'types/supabase';
import { Feature } from 'constants/pricing';
import { useAuth } from './useAuth';
import useFeature from './useFeature';

export default function useImport() {
  const { user } = useAuth();
  const canCreateNote = useFeature(Feature.NumOfNotes);
  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
  );

  const onImport = useCallback(() => {
    if (!canCreateNote) {
      setIsUpgradeModalOpen(true);
      return;
    }

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

      const importingToast = toast.info('Importing notes, please wait...', {
        autoClose: false,
      });

      // Add a new note for each imported note
      const promises: Promise<Note | null>[] = [];
      for (const file of inputElement.files) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        const fileContent = await file.text();

        const { result } = unified()
          .use(markdown)
          .use(wikiLinkPlugin, { aliasDivider: '|' })
          .use(remarkToSlate)
          .processSync(fileContent);

        const { content: slateContent, promises: noteLinkPromises } =
          fixNoteLinks(result as Descendant[]);

        await Promise.all(noteLinkPromises);

        promises.push(
          upsertNote({
            user_id: user.id,
            title: fileName,
            content: slateContent.length > 0 ? slateContent : undefined,
          })
        );
      }

      const newNotes = await Promise.all(promises);

      // Show a toast with the number of successfully imported notes
      toast.dismiss(importingToast);
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
  }, [user, canCreateNote, setIsUpgradeModalOpen]);

  return onImport;
}

/**
 * Fixes note links by adding the proper note id to the link.
 * The note id comes from an existing note, or a new note is created.
 */
const fixNoteLinks = (
  content: Descendant[]
): { content: Descendant[]; promises: Promise<Note | null>[] } => {
  const promises = [];

  const editor = withVoidElements(withLinks(createEditor()));
  editor.children = content;

  // Find note link elements
  const matchingElements = Editor.nodes<NoteLink>(editor, {
    at: [],
    match: (n) => Element.isElement(n) && n.type === ElementType.NoteLink,
  });

  const newNoteTitleToId: Record<string, string | undefined> = {};
  const notesArr = Object.values(store.getState().notes);
  for (const [node, path] of matchingElements) {
    const noteTitle = node.noteTitle;
    let noteId;

    const existingNoteId =
      newNoteTitleToId[noteTitle.toLowerCase()] ??
      notesArr.find((note) => caseInsensitiveStringEqual(note.title, noteTitle))
        ?.id;

    if (existingNoteId) {
      noteId = existingNoteId;
    } else {
      noteId = uuidv4(); // Create new note id
      newNoteTitleToId[noteTitle.toLowerCase()] = noteId; // Add to new notes array

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

  return { content: editor.children, promises };
};
