import { Editor, Element, Transforms, Range } from 'slate';
import type { ListElement } from 'types/slate';
import { ElementType } from 'types/slate';
import { isListType } from 'editor/formatting';
import { createNodeId } from '../withNodeId';

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
  { match: /^\[\]$/, type: ElementType.CheckListItem },
];

// Handle block shortcuts
const handleBlockShortcuts = (editor: Editor, text: string): boolean => {
  if (!editor.selection || !Range.isCollapsed(editor.selection)) {
    return false;
  }

  const block = Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  });
  const path = block ? block[1] : [];
  const lineStart = Editor.start(editor, path);
  const selectionAnchor = editor.selection.anchor;
  const beforeRange = { anchor: selectionAnchor, focus: lineStart };
  const beforeText = Editor.string(editor, beforeRange) + text;

  // Handle block shortcuts
  for (const shortcut of BLOCK_SHORTCUTS) {
    const { match, type } = shortcut;

    const result = beforeText.match(match);
    if (!result || result.index === undefined) {
      continue;
    }

    const endOfMatchOffset = result.index + result[0].length - text.length; // Make sure to subtract text length since it's not in the editor

    // Continue if the match does not end at the current selection
    // Ensures that we only just triggered the auto markdown with the text we inserted
    if (endOfMatchOffset !== editor.selection.anchor.offset) {
      continue;
    }

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
      { type },
      { match: (n) => Editor.isBlock(editor, n) }
    );

    if (type === ElementType.ListItem) {
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
    } else if (type === ElementType.ThematicBreak) {
      // Insert a new paragraph below thematic break
      Transforms.insertNodes(editor, {
        id: createNodeId(),
        type: ElementType.Paragraph,
        children: [{ text: '' }],
      });
    } else if (type === ElementType.CheckListItem) {
      Transforms.setNodes(editor, { checked: false });
    }

    return true;
  }

  return false;
};

export default handleBlockShortcuts;
