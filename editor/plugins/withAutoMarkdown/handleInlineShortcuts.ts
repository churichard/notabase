import { Editor, Range, Point } from 'slate';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { ElementType, Mark } from 'types/slate';
import { isMark } from 'editor/formatting';
import { store } from 'lib/store';
import upsertNote from 'lib/api/upsertNote';
import supabase from 'lib/supabase';
import { caseInsensitiveStringEqual } from 'utils/string';
import { MAX_NUM_OF_BASIC_NOTES, PlanId } from 'constants/pricing';
import { deleteText } from 'editor/transforms';
import handleMark from './handleMark';
import handleExternalLink from './handleExternalLink';
import handleNoteLink from './handleNoteLink';
import handleCustomNoteLink from './handleCustomNoteLink';
import handleBlockReference from './handleBlockReference';

enum CustomInlineShortcuts {
  CustomNoteLink = 'custom-note-link',
}

export enum LinkType {
  Note = 'note',
  Tag = 'tag',
}

export const BLOCK_REFERENCE_REGEX = /(?:^|\s)(\(\()(.+)(\)\))/;
const INLINE_SHORTCUTS: Array<
  | {
      match: RegExp;
      type:
        | Mark
        | CustomInlineShortcuts
        | ElementType.ExternalLink
        | ElementType.BlockReference;
    }
  | { match: RegExp; type: ElementType.NoteLink; linkType: LinkType }
> = [
  { match: /(?:^|\s)(\*\*)([^*]+)(\*\*)/, type: Mark.Bold },
  { match: /(?:^|\s)(__)([^_]+)(__)/, type: Mark.Bold },
  { match: /(?:^|\s)(\*)([^*]+)(\*)/, type: Mark.Italic },
  { match: /(?:^|\s)(_)([^_]+)(_)/, type: Mark.Italic },
  { match: /(?:^|\s)(`)([^`]+)(`)/, type: Mark.Code },
  { match: /(?:^|\s)(~~)([^~]+)(~~)/, type: Mark.Strikethrough },
  {
    match: /(?:^|\s)(\[)(.+)(\]\(\[\[)(.+)(\]\]\))/,
    type: CustomInlineShortcuts.CustomNoteLink,
  },
  { match: /(?:^|\s)(\[)(.+)(\]\()(.+)(\))/, type: ElementType.ExternalLink },
  {
    match: /(?:^|\s)(\[\[)(.+)(\]\])/,
    type: ElementType.NoteLink,
    linkType: LinkType.Note,
  },
  {
    match: /(?:^|\s)(#[^\s]+)(\s)/,
    type: ElementType.NoteLink,
    linkType: LinkType.Tag,
  },
  { match: BLOCK_REFERENCE_REGEX, type: ElementType.BlockReference },
];

// Handle inline shortcuts
const handleInlineShortcuts = (editor: Editor, text: string): boolean => {
  if (!editor.selection || !Range.isCollapsed(editor.selection)) {
    return false;
  }

  for (const shortcut of INLINE_SHORTCUTS) {
    const { match, type } = shortcut;

    const selectionAnchor = editor.selection.anchor;
    const elementStart = Editor.start(editor, selectionAnchor.path);
    const elementRange = { anchor: selectionAnchor, focus: elementStart };
    const elementText = Editor.string(editor, elementRange) + text;
    const result = elementText.match(match);

    if (!result || result.index === undefined) {
      continue;
    }

    const wholeMatch = result[0];
    const endOfMatchOffset = result.index + wholeMatch.length - text.length; // Make sure to subtract text length since it's not in the editor
    const endOfMatchPoint: Point = {
      offset: endOfMatchOffset,
      path: selectionAnchor.path,
    };

    // Continue if the match does not end at the current selection
    // Ensures that we only just triggered the auto markdown with the text we inserted
    if (endOfMatchOffset !== editor.selection.anchor.offset) {
      continue;
    }

    let handled = false;
    if (isMark(type)) {
      handled = handleMark(editor, type, result, endOfMatchPoint, text.length);
    } else if (type === ElementType.ExternalLink) {
      handled = handleExternalLink(
        editor,
        result,
        endOfMatchPoint,
        text.length
      );
    } else if (type === ElementType.NoteLink) {
      handled = handleNoteLink(
        editor,
        result,
        endOfMatchPoint,
        shortcut.linkType,
        text.length
      );
    } else if (type === CustomInlineShortcuts.CustomNoteLink) {
      handled = handleCustomNoteLink(
        editor,
        result,
        endOfMatchPoint,
        text.length
      );
    } else if (type === ElementType.BlockReference) {
      handled = handleBlockReference(
        editor,
        result,
        endOfMatchPoint,
        elementText === wholeMatch,
        text.length
      );
    }

    if (handled) {
      return handled;
    }
  }

  return false;
};

// If the normalized note title exists, then returns the existing note id.
// Otherwise, creates a new note id.
export const getOrCreateNoteId = (noteTitle: string): string | null => {
  let noteId;

  const notes = store.getState().notes;
  const notesArr = Object.values(notes);
  const matchingNote = notesArr.find((note) =>
    caseInsensitiveStringEqual(note.title, noteTitle)
  );

  if (matchingNote) {
    noteId = matchingNote.id;
  } else {
    const billingDetails = store.getState().billingDetails;
    if (
      (!billingDetails || billingDetails.planId === PlanId.Basic) &&
      notesArr.length >= MAX_NUM_OF_BASIC_NOTES
    ) {
      toast.error(
        `You have reached your ${MAX_NUM_OF_BASIC_NOTES} note limit. New notes will not be created or linked. For unlimited notes, please upgrade to the Pro plan.`
      );
      return null;
    }
    const userId = supabase.auth.user()?.id;
    noteId = uuidv4();
    if (userId) {
      upsertNote({ id: noteId, user_id: userId, title: noteTitle });
    }
  }

  return noteId;
};

type MarkupLengths = { startMark: number; text: number; endMark: number };
type MarkupLengthsWithTextToInsert = MarkupLengths & { textToInsert: number };

// Gets the markup lengths to remove, given that the textToInsertLength is the length
// of the text that has not been inserted into the editor
const getMarkupLengths = (
  markupLengths: MarkupLengthsWithTextToInsert
): MarkupLengths => {
  let currTextToInsertLength = markupLengths.textToInsert;
  let currStartMarkLength = markupLengths.startMark;
  let currTextLength = markupLengths.text;
  let currEndMarkLength = markupLengths.endMark;

  // Subtract textToInsertLength from the end mark
  if (currTextToInsertLength > 0 && currEndMarkLength > 0) {
    currEndMarkLength = Math.max(currEndMarkLength - currTextToInsertLength, 0);
    currTextToInsertLength -= markupLengths.endMark - currEndMarkLength;
  }

  // Subtract textToInsertLength from the text
  if (currTextToInsertLength > 0 && currTextLength > 0) {
    currTextLength = Math.max(currTextLength - currTextToInsertLength, 0);
    currTextToInsertLength -= markupLengths.text - currTextLength;
  }

  // Subtract textToInsertLength from the start mark
  if (currTextToInsertLength > 0 && currStartMarkLength > 0) {
    currStartMarkLength = Math.max(
      currStartMarkLength - currTextToInsertLength,
      0
    );
    currTextToInsertLength -= markupLengths.startMark - currStartMarkLength;
  }

  return {
    startMark: currStartMarkLength,
    text: currTextLength,
    endMark: currEndMarkLength,
  };
};

// Deletes beginning and ending markup and returns the range of the text in the middle
export const deleteMarkup = (
  editor: Editor,
  point: Point,
  lengths: MarkupLengthsWithTextToInsert
): Range => {
  const {
    startMark: startMarkLength,
    text: textLength,
    endMark: endMarkLength,
  } = getMarkupLengths(lengths);

  const pointPath = point.path;
  let pointOffset = point.offset;

  // Delete the ending mark
  deleteText(editor, pointPath, pointOffset, endMarkLength);
  pointOffset -= endMarkLength;

  // Delete the start mark
  deleteText(editor, pointPath, pointOffset - textLength, startMarkLength);
  pointOffset -= startMarkLength;

  // Return range of the text to format
  return {
    anchor: { path: pointPath, offset: pointOffset },
    focus: {
      path: pointPath,
      offset: pointOffset - textLength,
    },
  };
};

export default handleInlineShortcuts;
