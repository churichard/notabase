import { Editor, Element, Transforms, Range, Point, Text, Path } from 'slate';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import type { ExternalLink, ListElement, NoteLink } from 'types/slate';
import { ElementType, Mark } from 'types/slate';
import { insertBlockReference, isListType, isMark } from 'editor/formatting';
import { isUrl } from 'utils/url';
import { store } from 'lib/store';
import upsertNote from 'lib/api/upsertNote';
import supabase from 'lib/supabase';
import { caseInsensitiveStringEqual } from 'utils/string';
import { PlanId } from 'constants/pricing';
import { createNodeId } from './withNodeId';

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
  { match: /^\*\*\*$/, type: ElementType.ThematicBreak },
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
    | ElementType.NoteLink
    | ElementType.BlockReference;
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
  { match: /(?:^|\s)(\(\()(.+)(\)\))/, type: ElementType.BlockReference },
];

// Add auto-markdown formatting shortcuts
const withAutoMarkdown = (editor: Editor) => {
  const { insertText, insertData } = editor;

  editor.insertText = (text) => {
    insertText(text);
    handleAutoMarkdown(editor);
  };

  editor.insertData = (data) => {
    insertData(data);
    // TODO: make sure multiple markdown elements inserted in the same data are all handled
    handleAutoMarkdown(editor);
  };

  return editor;
};

const handleAutoMarkdown = (editor: Editor) => {
  // Don't handle auto markdown shortcuts in code blocks
  const inCodeBlock = Editor.above(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      Element.isElement(n) &&
      n.type === ElementType.CodeBlock,
  });

  if (inCodeBlock) {
    return;
  }

  // Handle shortcuts at the beginning of a line
  handleBlockShortcuts(editor);

  // Handle inline shortcuts
  handleInlineShortcuts(editor);
};

// Handle block shortcuts
const handleBlockShortcuts = (editor: Editor) => {
  if (!editor.selection || !Range.isCollapsed(editor.selection)) {
    return;
  }

  const block = Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  });
  const path = block ? block[1] : [];
  const lineStart = Editor.start(editor, path);
  const selectionAnchor = editor.selection.anchor;
  const beforeRange = { anchor: selectionAnchor, focus: lineStart };
  const beforeText = Editor.string(editor, beforeRange);

  // Handle block shortcuts
  for (const shortcut of BLOCK_SHORTCUTS) {
    if (beforeText.match(shortcut.match)) {
      // Delete markdown text
      Transforms.select(editor, beforeRange);
      Transforms.delete(editor);

      // Unwrap lists if there are any
      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
        split: true,
      });

      // Update node type
      Transforms.setNodes(
        editor,
        { type: shortcut.type },
        { match: (n) => Editor.isBlock(editor, n) }
      );

      if (shortcut.type === ElementType.ListItem) {
        const list: ListElement = {
          id: createNodeId(),
          type: shortcut.listType,
          children: [],
        };
        Transforms.wrapNodes(editor, list, {
          match: (n) =>
            !Editor.isEditor(n) &&
            Element.isElement(n) &&
            n.type === ElementType.ListItem,
        });
      } else if (shortcut.type === ElementType.ThematicBreak) {
        // Insert a new paragraph below thematic break
        Transforms.insertNodes(editor, {
          id: createNodeId(),
          type: ElementType.Paragraph,
          children: [{ text: '' }],
        });
      }
      return;
    }
  }
};

// Handle inline shortcuts
const handleInlineShortcuts = (editor: Editor) => {
  if (!editor.selection || !Range.isCollapsed(editor.selection)) {
    return;
  }

  for (const { match, type } of INLINE_SHORTCUTS) {
    const selectionAnchor = editor.selection.anchor;
    const elementStart = Editor.start(editor, selectionAnchor.path);
    const elementRange = { anchor: selectionAnchor, focus: elementStart };
    const elementText = Editor.string(editor, elementRange);
    const result = elementText.match(match);

    if (!result || result.index === undefined) {
      continue;
    }

    const endOfMatchPoint: Point = {
      offset: result.index + result[0].length,
      path: selectionAnchor.path,
    };

    if (isMark(type)) {
      const [, startMark, textToFormat, endMark] = result;

      const textRange = deleteMarkup(editor, endOfMatchPoint, {
        startMark: startMark.length,
        text: textToFormat.length,
        endMark: endMark.length,
      });

      // Add formatting mark to the text to format
      Transforms.setNodes(
        editor,
        { [type]: true },
        { at: textRange, match: (n) => Text.isText(n), split: true }
      );
      Editor.removeMark(editor, type);

      return;
    } else if (type === ElementType.ExternalLink) {
      const [, startMark, linkText, middleMark, linkUrl, endMark] = result;

      if (!isUrl(linkUrl)) {
        continue;
      }

      const linkTextRange = deleteMarkup(editor, endOfMatchPoint, {
        startMark: startMark.length,
        text: linkText.length,
        endMark: middleMark.length + linkUrl.length + endMark.length,
      });
      const link: ExternalLink = {
        id: createNodeId(),
        type: ElementType.ExternalLink,
        url: linkUrl,
        children: [],
      };
      Transforms.wrapNodes(editor, link, {
        at: linkTextRange,
        split: true,
      });

      return;
    } else if (type === ElementType.NoteLink) {
      const [, startMark, noteTitle, endMark] = result;

      // Get or generate note id
      const noteId = getOrCreateNoteId(noteTitle);

      if (!noteId) {
        continue;
      }

      // Wrap text in a link
      const noteTitleRange = deleteMarkup(editor, endOfMatchPoint, {
        startMark: startMark.length,
        text: noteTitle.length,
        endMark: endMark.length,
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

      return;
    } else if (type === CustomInlineShortcuts.CustomNoteLink) {
      const [, startMark, linkText, middleMark, noteTitle, endMark] = result;

      // Get or generate note id
      const noteId = getOrCreateNoteId(noteTitle);

      if (!noteId) {
        continue;
      }

      // Wrap text in a link
      const linkTextRange = deleteMarkup(editor, endOfMatchPoint, {
        startMark: startMark.length,
        text: linkText.length,
        endMark: middleMark.length + noteTitle.length + endMark.length,
      });
      const link: NoteLink = {
        id: createNodeId(),
        type: ElementType.NoteLink,
        noteId,
        noteTitle,
        customText: linkText,
        children: [],
      };
      Transforms.wrapNodes(editor, link, {
        at: linkTextRange,
        split: true,
      });
      Transforms.move(editor, { unit: 'offset' });

      return;
    } else if (type === ElementType.BlockReference) {
      const [wholeMatch, startMark, blockId, endMark] = result;

      // Delete markdown and insert block reference
      const length = startMark.length + blockId.length + endMark.length;
      deleteText(editor, endOfMatchPoint.path, endOfMatchPoint.offset, length);

      insertBlockReference(editor, blockId, elementText === wholeMatch);

      return;
    }
  }
};

// If the normalized note title exists, then returns the existing note id.
// Otherwise, creates a new note id.
const getOrCreateNoteId = (noteTitle: string): string | null => {
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
      notesArr.length >= 50
    ) {
      toast.error(
        'You have reached your 50 note limit. New notes will not be created or linked. For unlimited notes, please upgrade to the Pro plan.'
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

// Deletes beginning and ending markup and returns the range of the text in the middle
const deleteMarkup = (
  editor: Editor,
  point: Point,
  lengths: { startMark: number; text: number; endMark: number }
): Range => {
  const {
    startMark: startMarkLength,
    text: textLength,
    endMark: endMarkLength,
  } = lengths;

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
