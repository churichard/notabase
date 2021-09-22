import { Editor, Point, Transforms } from 'slate';
import { ElementType, NoteLink } from 'types/slate';
import { createNodeId } from '../withNodeId';
import {
  deleteMarkup,
  getOrCreateNoteId,
  LinkType,
} from './handleInlineShortcuts';

export default function handleNoteLink(
  editor: Editor,
  result: RegExpMatchArray,
  endOfMatchPoint: Point,
  linkType: LinkType,
  textToInsertLength: number
): boolean {
  if (linkType === LinkType.Note) {
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
  } else if (linkType === LinkType.Tag) {
    const [, tagName, endMark] = result;

    // Get or generate note id
    const noteId = getOrCreateNoteId(tagName);

    if (!noteId) {
      return false;
    }

    // Convert the tag name to a link
    const tagRange = deleteMarkup(editor, endOfMatchPoint, {
      startMark: 0,
      text: tagName.length,
      endMark: endMark.length,
      textToInsert: textToInsertLength,
    });

    const link: NoteLink = {
      id: createNodeId(),
      type: ElementType.NoteLink,
      noteId,
      noteTitle: tagName,
      isTag: true,
      children: [],
    };

    Transforms.wrapNodes(editor, link, { at: tagRange, split: true });
    Transforms.move(editor, { unit: 'offset' });
    Transforms.insertText(editor, ' '); // We insert the trigger character (a space)

    return true;
  }

  return false;
}
