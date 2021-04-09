import { useCallback, useEffect } from 'react';
import { Descendant, Editor, Range, Transforms } from 'slate';
import { toast } from 'react-toastify';
import { ElementType, NoteLink } from 'types/slate';
import getOrAddNote from 'lib/api/getOrAddNote';
import addLink from 'lib/api/addLink';
import { useAuth } from 'utils/useAuth';
import { useCurrentNote } from 'utils/useCurrentNote';
import { deleteText } from './transforms';

export default function useNoteLinks(
  editor: Editor,
  editorValue: Descendant[]
) {
  const { user } = useAuth();
  const currentNote = useCurrentNote();

  const handleNoteLinks = useCallback(async () => {
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
      title: noteTitle,
      children: [],
    };
    Transforms.wrapNodes(editor, link, {
      at: noteTitleRange,
      split: true,
    });

    // Get (or add) the note and add a link to it
    if (user) {
      const note = await getOrAddNote(user.id, noteTitle);
      if (note) {
        addLink(user.id, currentNote.id, note.id);
      } else {
        toast.error('There was an error getting/adding the proper note.');
      }
    }
  }, [editor, user, currentNote.id]);

  useEffect(() => {
    handleNoteLinks();
  }, [editorValue, handleNoteLinks]);
}
