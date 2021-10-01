import { Editor, Point, Transforms } from 'slate';
import { ElementType, NoteLink } from 'types/slate';
import { createNodeId } from '../withNodeId';
import { deleteMarkup, getOrCreateNoteId } from './handleInlineShortcuts';

export default function handleNoteLink(
  editor: Editor,
  result: RegExpMatchArray,
  endOfMatchPoint: Point,
  textToInsertLength: number
): boolean {
  const [, startMark, noteTitle, endMark] = result;

  // Get or generate note id
  const noteId = getOrCreateNoteId(noteTitle);

  if (!noteId) {
    return false;
  }

  // Wrap text in a link
  const noteTitleRange = deleteMarkup(editor, endOfMatchPoint, {
    startMark: startMark.length,
    text: noteTitle.length,
    endMark: endMark.length,
    textToInsert: textToInsertLength,
  });
  const link: NoteLink = {
    id: createNodeId(),
    type: ElementType.NoteLink,
    noteId,
    noteTitle,
    children: [],
  };

  Transforms.wrapNodes(editor, link, {
    at: noteTitleRange,
    split: true,
  });
  Transforms.move(editor, { unit: 'offset' });

  return true;
}
