import { useCallback, useEffect } from 'react';
import { Descendant, Editor, Range, Transforms } from 'slate';
import { v4 as uuidv4 } from 'uuid';
import { ElementType, NoteLink } from 'types/slate';
import getOrAddNote from 'lib/api/getOrAddNote';
import useNotes from 'lib/api/useNotes';
import { useAuth } from 'utils/useAuth';
import { deleteText } from './transforms';

export default function useNoteLinks(
  editor: Editor,
  editorValue: Descendant[]
) {
  const { user } = useAuth();
  const { data: notes = [] } = useNotes();

  const handleNoteLinks = useCallback(async () => {
    if (!user) {
      return;
    }

    const NOTE_LINK_REGEX = /(?:^|\s)(\[\[)(.+)(\]\])/;
    const { selection } = editor;

    if (!selection || !Range.isCollapsed(selection)) {
      return;
    }

    const { anchor } = selection;

    const elementStart = Editor.start(editor, anchor.path);
    const elementRange = { anchor, focus: elementStart };
    const elementText = Editor.string(editor, elementRange);

    const result = elementText.match(NOTE_LINK_REGEX);

    if (!result) {
      return;
    }

    const selectionPath = anchor.path;
    let endOfSelection = anchor.offset;

    const [, startMark, noteTitle, endMark] = result;
    const endMarkLength = endMark.length;

    // Delete the ending mark
    deleteText(editor, selectionPath, endOfSelection, endMarkLength);
    endOfSelection -= endMarkLength;

    // Delete the start mark
    deleteText(
      editor,
      selectionPath,
      endOfSelection - noteTitle.length,
      startMark.length
    );
    endOfSelection -= startMark.length;

    // Get or generate note id
    let noteId;
    const matchingNote = notes.find((note) => note.title === noteTitle);
    if (matchingNote) {
      noteId = matchingNote.id;
    } else {
      noteId = uuidv4();
      getOrAddNote(user.id, noteTitle, noteId);
    }

    // Wrap text in a link
    const noteTitleRange = {
      anchor: { path: selectionPath, offset: endOfSelection },
      focus: {
        path: selectionPath,
        offset: endOfSelection - noteTitle.length,
      },
    };
    const link: NoteLink = {
      type: ElementType.NoteLink,
      noteId,
      noteTitle,
      isTextTitle: true,
      children: [],
    };
    Transforms.wrapNodes(editor, link, {
      at: noteTitleRange,
      split: true,
    });
  }, [editor, user, notes]);

  useEffect(() => {
    handleNoteLinks();
  }, [editorValue, handleNoteLinks]);
}
