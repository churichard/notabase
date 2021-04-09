import { Editor, Element, Transforms, Range, Point, Text, Path } from 'slate';
import { ElementType, ExternalLink, ListElement, Mark } from 'types/slate';
import { isMark } from 'editor/formatting';
import isUrl from 'utils/isUrl';

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
    match: /^(\*|-|\+)$/,
    type: ElementType.ListItem,
    listType: ElementType.BulletedList,
  }, // match *, -, or +
  {
    match: /^([0-9]+\.)$/,
    type: ElementType.ListItem,
    listType: ElementType.NumberedList,
  }, // match numbered lists
  { match: /^>$/, type: ElementType.Blockquote },
  { match: /^#$/, type: ElementType.HeadingOne },
  { match: /^##$/, type: ElementType.HeadingTwo },
  { match: /^###$/, type: ElementType.HeadingThree },
];

const INLINE_SHORTCUTS: Array<{
  match: RegExp;
  type: Mark | ElementType.ExternalLink;
}> = [
  { match: /(?:^|\s)(\*\*)([^*]+)(\*\*)/, type: Mark.Bold },
  { match: /(?:^|\s)(__)([^_]+)(__)/, type: Mark.Bold },
  { match: /(?:^|\s)(\*)([^*]+)(\*)/, type: Mark.Italic },
  { match: /(?:^|\s)(_)([^_]+)(_)/, type: Mark.Italic },
  { match: /(?:^|\s)(`)(.+)(`)/, type: Mark.Code },
  { match: /(?:^|\s)(\[)(.+)(\]\()(.+)(\))/, type: ElementType.ExternalLink },
];

// Add auto-markdown formatting shortcuts
const withAutoMarkdown = (editor: Editor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (!selection || !Range.isCollapsed(selection)) {
      insertText(text);
      return;
    }

    const { anchor } = selection;

    // Handle shortcuts at the beginning of a line
    if (text === ' ') {
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const lineStart = Editor.start(editor, path);
      const beforeRange = { anchor, focus: lineStart };
      const beforeText = Editor.string(editor, beforeRange);

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
          return;
        }
      }
    }

    // Handle inline shortcuts
    const elementStart = Editor.start(editor, anchor.path);
    const elementRange = { anchor, focus: elementStart };
    const elementText = Editor.string(editor, elementRange) + text;

    for (const { match, type } of INLINE_SHORTCUTS) {
      const result = elementText.match(match);

      if (!result) {
        continue;
      }

      const selectionPath = anchor.path;
      let endOfSelection = anchor.offset;
      if (isMark(type)) {
        const [, startMark, textToFormat, endMark] = result;
        const endMarkLength = endMark.length - 1; // The last character is not in the editor

        // Delete the ending mark
        deleteText(editor, selectionPath, endOfSelection, endMarkLength);
        endOfSelection -= endMarkLength;

        // Delete the start mark
        deleteText(
          editor,
          selectionPath,
          endOfSelection - textToFormat.length,
          startMark.length
        );
        endOfSelection -= startMark.length;

        // Add formatting mark to the text to format
        const textToFormatRange = {
          anchor: { path: selectionPath, offset: endOfSelection },
          focus: {
            path: selectionPath,
            offset: endOfSelection - textToFormat.length,
          },
        };
        Transforms.setNodes(
          editor,
          { [type]: true },
          { at: textToFormatRange, match: (n) => Text.isText(n), split: true }
        );
        Editor.removeMark(editor, type);

        return;
      } else if (type === ElementType.ExternalLink) {
        const [, startMark, linkText, middleMark, linkUrl, endMark] = result;
        const endMarkLength = endMark.length - 1; // The last character is not in the editor

        if (!isUrl(linkUrl)) {
          insertText(text);
          return;
        }

        // Delete the middle mark, link url, and end mark
        const endLength = middleMark.length + linkUrl.length + endMarkLength;
        deleteText(editor, selectionPath, endOfSelection, endLength);
        endOfSelection -= endLength;

        // Delete the start mark
        deleteText(
          editor,
          selectionPath,
          endOfSelection - linkText.length,
          startMark.length
        );
        endOfSelection -= startMark.length;

        // Wrap text in a link
        const linkTextRange = {
          anchor: { path: selectionPath, offset: endOfSelection },
          focus: {
            path: selectionPath,
            offset: endOfSelection - linkText.length,
          },
        };
        const link: ExternalLink = {
          type: ElementType.ExternalLink,
          url: linkUrl,
          children: [],
        };
        Transforms.wrapNodes(editor, link, { at: linkTextRange, split: true });

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          !Editor.isEditor(block) &&
          Element.isElement(block) &&
          block.type !== ElementType.Paragraph &&
          block.type !== ElementType.ListItem &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: ElementType.Paragraph });
          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
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
