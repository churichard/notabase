import type { Path } from 'slate';
import { Editor, Element, Transforms, Range, Point, Text } from 'slate';
import { v4 as uuidv4 } from 'uuid';
import type { ExternalLink, ListElement, NoteLink } from 'types/slate';
import { ElementType, Mark } from 'types/slate';
import { isMark } from 'editor/formatting';
import { isUrl } from 'utils/url';
import { store } from 'lib/store';
import upsertNote from 'lib/api/upsertNote';
import supabase from 'lib/supabase';
import { caseInsensitiveStringEqual } from 'utils/string';

const BLOCK_SHORTCUTS: Array<
  | {
      match: RegExp;
      type: Exclude<ElementType, ElementType.ListItem>;
    }
  | {
      match: RegExp;
      type: ElementType.ListItem;
      listType: ElementType.BulletedList | ElementType.NumberedList;
    }
> = [
  {
    match: /^(\*|-|\+) $/,
    type: ElementType.ListItem,
    listType: ElementType.BulletedList,
  }, // match *, -, or +
  {
    match: /^([0-9]+\.) $/,
    type: ElementType.ListItem,
    listType: ElementType.NumberedList,
  }, // match numbered lists
  { match: /^> $/, type: ElementType.Blockquote },
  { match: /^# $/, type: ElementType.HeadingOne },
  { match: /^## $/, type: ElementType.HeadingTwo },
  { match: /^### $/, type: ElementType.HeadingThree },
  { match: /^```$/, type: ElementType.CodeBlock },
  { match: /^---$/, type: ElementType.ThematicBreak },
];

enum CustomInlineShortcuts {
  CustomNoteLink = 'custom-note-link',
}

const INLINE_SHORTCUTS: Array<{
  match: RegExp;
  type:
    | Mark
    | CustomInlineShortcuts
    | ElementType.ExternalLink
    | ElementType.NoteLink;
}> = [
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
  { match: /(?:^|\s)(\[\[)(.+)(\]\])/, type: ElementType.NoteLink },
];

// Add auto-markdown formatting shortcuts
const withAutoMarkdown = (editor: Editor) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (!selection || !Range.isCollapsed(selection) || text.length > 1) {
      insertText(text);
      return;
    }

    const { anchor } = selection;

    // Handle shortcuts at the beginning of a line
    const blockHandled = handleBlockShortcuts(editor, anchor, text);
    if (blockHandled) {
      return;
    }

    // Handle inline shortcuts
    const inlineHandled = handleInlineShortcuts(editor, anchor, text);
    if (inlineHandled) {
      return;
    }

    insertText(text);
  };

  return editor;
};

// Returns true if a block shortcut was found and handled; otherwise, returns false.
const handleBlockShortcuts = (
  editor: Editor,
  selectionAnchor: Point,
  textToInsert: string
): boolean => {
  const block = Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  });
  const path = block ? block[1] : [];
  const lineStart = Editor.start(editor, path);
  const beforeRange = { anchor: selectionAnchor, focus: lineStart };
  const beforeText = Editor.string(editor, beforeRange) + textToInsert;

  // Handle block shortcuts
  for (const shortcut of BLOCK_SHORTCUTS) {
    if (beforeText.match(shortcut.match)) {
      Transforms.select(editor, beforeRange);
      Transforms.delete(editor);
      Transforms.setNodes(
        editor,
        { type: shortcut.type },
        { match: (n) => Editor.isBlock(editor, n) }
      );

      if (shortcut.type === ElementType.ListItem) {
        const list: ListElement = {
          type: shortcut.listType,
          children: [],
        };
        Transforms.wrapNodes(editor, list, {
          match: (n) =>
            !Editor.isEditor(n) &&
            Element.isElement(n) &&
            n.type === ElementType.ListItem,
        });
      }
      return true;
    }
  }

  return false;
};

// Returns true if an inline shortcut was found and handled; otherwise, returns false.
const handleInlineShortcuts = (
  editor: Editor,
  selectionAnchor: Point,
  textToInsert: string
): boolean => {
  const elementStart = Editor.start(editor, selectionAnchor.path);
  const elementRange = { anchor: selectionAnchor, focus: elementStart };
  const insertedElementText = Editor.string(editor, elementRange);
  const elementText = insertedElementText + textToInsert;

  for (const { match, type } of INLINE_SHORTCUTS) {
    const result = elementText.match(match);
    const insertedResult = insertedElementText.match(match);

    // We only care about matches that happen as a result of the inserted character
    if (!result || (result && insertedResult)) {
      continue;
    }

    if (isMark(type)) {
      const [, startMark, textToFormat, endMark] = result;

      const textRange = deleteMarkup(editor, selectionAnchor, {
        startMark: startMark.length,
        text: textToFormat.length,
        endMark: endMark.length - 1, // The last character is not in the editor
      });

      // Add formatting mark to the text to format
      Transforms.setNodes(
        editor,
        { [type]: true },
        { at: textRange, match: (n) => Text.isText(n), split: true }
      );
      Editor.removeMark(editor, type);

      return true;
    } else if (type === ElementType.ExternalLink) {
      const [, startMark, linkText, middleMark, linkUrl, endMark] = result;

      if (!isUrl(linkUrl)) {
        return false;
      }

      const linkTextRange = deleteMarkup(editor, selectionAnchor, {
        startMark: startMark.length,
        text: linkText.length,
        endMark: middleMark.length + linkUrl.length + endMark.length - 1, // The last character is not in the editor
      });
      const link: ExternalLink = {
        type: ElementType.ExternalLink,
        url: linkUrl,
        children: [],
      };
      Transforms.wrapNodes(editor, link, { at: linkTextRange, split: true });

      return true;
    } else if (type === ElementType.NoteLink) {
      const [, startMark, noteTitle, endMark] = result;

      // Get or generate note id
      const noteId = getOrCreateNoteId(noteTitle);

      // Wrap text in a link
      const noteTitleRange = deleteMarkup(editor, selectionAnchor, {
        startMark: startMark.length,
        text: noteTitle.length,
        endMark: endMark.length - 1, // The last character is not in the editor
      });
      const link: NoteLink = {
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
    } else if (type === CustomInlineShortcuts.CustomNoteLink) {
      const [, startMark, linkText, middleMark, noteTitle, endMark] = result;

      // Get or generate note id
      const noteId = getOrCreateNoteId(noteTitle);

      // Wrap text in a link
      const linkTextRange = deleteMarkup(editor, selectionAnchor, {
        startMark: startMark.length,
        text: linkText.length,
        endMark: middleMark.length + noteTitle.length + endMark.length - 1, // The last character is not in the editor
      });
      const link: NoteLink = {
        type: ElementType.NoteLink,
        noteId,
        noteTitle,
        customText: linkText,
        children: [],
      };
      Transforms.wrapNodes(editor, link, { at: linkTextRange, split: true });
      Transforms.move(editor, { unit: 'offset' });

      return true;
    }
  }

  return false;
};

// If the normalized note title exists, then returns the existing note id.
// Otherwise, creates a new note id.
const getOrCreateNoteId = (noteTitle: string): string => {
  let noteId;

  const notes = store.getState().notes;
  const matchingNote = Object.values(notes).find((note) =>
    caseInsensitiveStringEqual(note.title, noteTitle)
  );

  if (matchingNote) {
    noteId = matchingNote.id;
  } else {
    const userId = supabase.auth.user()?.id;
    noteId = uuidv4();
    if (userId) {
      upsertNote({ id: noteId, user_id: userId, title: noteTitle });
    }
  }

  return noteId;
};

// Deletes beginning and ending markup and returns the range of the text in the middle
const deleteMarkup = (
  editor: Editor,
  selectionAnchor: Point,
  lengths: { startMark: number; text: number; endMark: number }
): Range => {
  const {
    startMark: startMarkLength,
    text: textLength,
    endMark: endMarkLength,
  } = lengths;

  const selectionPath = selectionAnchor.path;
  let endOfSelection = selectionAnchor.offset;

  // Delete the ending mark
  deleteText(editor, selectionPath, endOfSelection, endMarkLength);
  endOfSelection -= endMarkLength;

  // Delete the start mark
  deleteText(
    editor,
    selectionPath,
    endOfSelection - textLength,
    startMarkLength
  );
  endOfSelection -= startMarkLength;

  // Return range of the text to format
  return {
    anchor: { path: selectionPath, offset: endOfSelection },
    focus: {
      path: selectionPath,
      offset: endOfSelection - textLength,
    },
  };
};

// Deletes `length` characters at the specified path and offset
const deleteText = (
  editor: Editor,
  path: Path,
  offset: number,
  length: number
) => {
  const anchorOffset = offset - length;
  if (anchorOffset === offset) {
    return; // Don't delete anything if the two offsets are the same
  }
  const range = {
    anchor: { path, offset: anchorOffset },
    focus: { path, offset },
  };
  Transforms.delete(editor, { at: range });
};

export default withAutoMarkdown;
