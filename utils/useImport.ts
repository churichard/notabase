import { useCallback } from 'react';
import { Descendant, Element } from 'slate';
import { toast } from 'react-toastify';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import wikiLinkPlugin from 'remark-wiki-link';
import { v4 as uuidv4 } from 'uuid';
import { store, useStore } from 'lib/store';
import supabase from 'lib/supabase';
import { getDefaultEditorValue } from 'editor/constants';
import remarkToSlate from 'editor/serialization/remarkToSlate';
import { caseInsensitiveStringEqual } from 'utils/string';
import { ElementType, NoteLink } from 'types/slate';
import { Note, NoteInsert } from 'types/supabase';
import { Feature, MAX_NUM_OF_BASIC_NOTES, PlanId } from 'constants/pricing';
import { useAuth } from './useAuth';
import useFeature from './useFeature';

export default function useImport() {
  const { user } = useAuth();
  const canCreateNote = useFeature(Feature.NumOfNotes);
  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
  );

  const getNoteId = useCallback(
    (
      node: NoteLink,
      notes: Note[],
      noteTitleToIdCache: Record<string, string | undefined>,
      upsertData: NoteInsert[]
    ): string => {
      if (!user) {
        throw new Error('Could not get note id - no user was found.');
      }

      const noteTitle = node.noteTitle;
      let noteId;

      const existingNoteId =
        noteTitleToIdCache[noteTitle.toLowerCase()] ??
        notes.find((note) => caseInsensitiveStringEqual(note.title, noteTitle))
          ?.id;

      if (existingNoteId) {
        noteId = existingNoteId;
      } else {
        noteId = uuidv4(); // Create new note id
        upsertData.push({ id: noteId, user_id: user.id, title: noteTitle });
      }
      noteTitleToIdCache[noteTitle.toLowerCase()] = noteId; // Add to cache
      return noteId;
    },
    [user]
  );

  const setNoteLinkIds = useCallback(
    (
      node: Descendant,
      notes: Note[],
      noteTitleToIdCache: Record<string, string | undefined>,
      upsertData: NoteInsert[]
    ): Descendant => {
      if (Element.isElement(node)) {
        return {
          ...node,
          ...(node.type === ElementType.NoteLink
            ? { noteId: getNoteId(node, notes, noteTitleToIdCache, upsertData) }
            : {}),
          children: node.children.map((child) =>
            setNoteLinkIds(child, notes, noteTitleToIdCache, upsertData)
          ),
        };
      } else {
        return node;
      }
    },
    [getNoteId]
  );

  /**
   * Fixes note links by adding the proper note id to the link.
   * The note id comes from an existing note, or a new note is created.
   */
  const fixNoteLinks = useCallback(
    (
      content: Descendant[],
      noteTitleToIdCache: Record<string, string | undefined> = {}
    ): { content: Descendant[]; upsertData: NoteInsert[] } => {
      const upsertData: NoteInsert[] = [];

      // Update note link elements with noteId
      const notesArr = Object.values(store.getState().notes);
      const newContent = content.map((node) =>
        setNoteLinkIds(node, notesArr, noteTitleToIdCache, upsertData)
      );

      return { content: newContent, upsertData };
    },
    [setNoteLinkIds]
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

      const planId = store.getState().billingDetails.planId;
      const totalNotes =
        Object.keys(store.getState().notes).length + inputElement.files.length;
      if (planId === PlanId.Basic && totalNotes > MAX_NUM_OF_BASIC_NOTES) {
        toast.error(
          `You cannot have more than ${MAX_NUM_OF_BASIC_NOTES} notes on the Basic plan. Upgrade to the Pro plan for unlimited notes.`
        );
        return;
      }

      const importingToast = toast.info('Importing notes, please wait...', {
        autoClose: false,
        closeButton: false,
        draggable: false,
      });

      // Add a new note for each imported note
      const upsertData: NoteInsert[] = [];
      const noteLinkUpsertData: NoteInsert[] = [];
      const noteTitleToIdCache: Record<string, string | undefined> = {};
      for (const file of inputElement.files) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
        if (!fileName) {
          continue;
        }
        const fileContent = await file.text();

        const { result } = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(wikiLinkPlugin, { aliasDivider: '|' })
          .use(remarkToSlate)
          .processSync(fileContent);

        const { content: slateContent, upsertData: newUpsertData } =
          fixNoteLinks(result as Descendant[], noteTitleToIdCache);

        noteLinkUpsertData.push(...newUpsertData);
        upsertData.push({
          user_id: user.id,
          title: fileName,
          content:
            slateContent.length > 0 ? slateContent : getDefaultEditorValue(),
        });
      }

      // Create new notes that are linked to
      const { data: newLinkedNotes } = await supabase
        .from('notes')
        .upsert(noteLinkUpsertData, { onConflict: 'user_id, title' })
        .select();

      // Create new notes from files
      const { data: newNotes } = await supabase
        .from('notes')
        .upsert(upsertData, { onConflict: 'user_id, title' })
        .select();

      // Show a toast with the number of successfully imported notes
      toast.dismiss(importingToast);
      const numOfSuccessfulImports =
        [...(newLinkedNotes ?? []), ...(newNotes ?? [])]?.filter(
          (note) => !!note
        ).length ?? 0;
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
  }, [user, canCreateNote, setIsUpgradeModalOpen, fixNoteLinks]);

  return onImport;
}
