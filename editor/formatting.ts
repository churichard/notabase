import { Editor, Element, Transforms, Range, Text, Node, Path } from 'slate';
import { store } from 'lib/store';
import type {
  ExternalLink,
  NoteLink,
  ListElement,
  Image,
  BlockReference,
} from 'types/slate';
import { ElementType, Mark } from 'types/slate';
import { computeBlockReference } from './backlinks/useBlockReference';
import { createNodeId } from './plugins/withNodeId';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isMark = (type: any): type is Mark => {
  return Object.values(Mark).includes(type as Mark);
};

export const isListType = (
  type: ElementType
): type is ElementType.BulletedList | ElementType.NumberedList => {
  return type === ElementType.BulletedList || type === ElementType.NumberedList;
};

export const isMarkActive = (editor: Editor, format: Mark) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => Text.isText(n) && n[format] === true,
    mode: 'all',
  });
  return !!match;
};

export const toggleMark = (editor: Editor, format: Mark) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const inChildOfElementType = (
  editor: Editor,
  format: ElementType,
  path?: Path
) => {
  const parentElement = Editor.above<Element>(editor, {
    ...(path ? { at: path } : {}),
    match: (n) =>
      !Editor.isEditor(n) &&
      Element.isElement(n) &&
      (!isListType(format) || n.type !== ElementType.ListItem), // If format is a list, we want to skip list items
  });
  return parentElement ? parentElement[0].type === format : false;
};

export const isElementActive = (
  editor: Editor,
  format: ElementType,
  path?: Path
) => {
  let formatToMatch = format;
  if (isListType(format)) {
    if (!inChildOfElementType(editor, format, path)) {
      return false;
    }
    formatToMatch = ElementType.ListItem;
  }

  const [match] = Editor.nodes(editor, {
    ...(path ? { at: path } : {}),
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === formatToMatch,
  });

  return !!match;
};

export const toggleElement = (
  editor: Editor,
  format: ElementType,
  path?: Path
) => {
  const pathRef = path ? Editor.pathRef(editor, path) : null;
  const isActive = isElementActive(editor, format);

  // Returns the current path
  const getCurrentLocation = () => pathRef?.current ?? undefined;

  // Unwrap list
  Transforms.unwrapNodes(editor, {
    at: getCurrentLocation(),
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
    split: true,
  });

  let newType;
  if (isActive) {
    newType = ElementType.Paragraph;
  } else if (isListType(format)) {
    newType = ElementType.ListItem;
  } else {
    newType = format;
  }
  const newProperties: Partial<Element> = { type: newType };
  Transforms.setNodes(editor, newProperties, { at: getCurrentLocation() });

  if (!isActive && isListType(format)) {
    const block: ListElement = {
      id: createNodeId(),
      type: format,
      children: [],
    };
    Transforms.wrapNodes(editor, block, { at: getCurrentLocation() });
  }
};

export const handleIndent = (editor: Editor) => {
  if (isElementActive(editor, ElementType.BulletedList)) {
    Transforms.wrapNodes(editor, {
      id: createNodeId(),
      type: ElementType.BulletedList,
      children: [],
    });
  } else if (isElementActive(editor, ElementType.NumberedList)) {
    Transforms.wrapNodes(editor, {
      id: createNodeId(),
      type: ElementType.NumberedList,
      children: [],
    });
  } else if (isElementActive(editor, ElementType.CodeBlock)) {
    Transforms.insertText(editor, '\t');
  }
};

export const handleUnindent = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) {
    return;
  }

  const ancestors = Node.ancestors(editor, selection.anchor.path);
  let numOfLists = 0;
  for (const [ancestorNode] of ancestors) {
    if (Element.isElement(ancestorNode) && isListType(ancestorNode.type)) {
      numOfLists++;
    }
  }

  // Only unindent if there would be another list above the current node
  if (numOfLists > 1) {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
      split: true,
    });
  }
};

export const handleEnter = (editor: Editor) => {
  if (isElementActive(editor, ElementType.CodeBlock)) {
    Transforms.insertText(editor, '\n');
  } else {
    editor.insertBreak();
  }
};

export const removeLink = (editor: Editor) => {
  unwrapLink(editor);
  Transforms.collapse(editor, { edge: 'end' });
};

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      Element.isElement(n) &&
      (n.type === ElementType.ExternalLink || n.type === ElementType.NoteLink),
    voids: true,
  });
};

const wrapLink = (editor: Editor, link: ExternalLink | NoteLink) => {
  const { selection } = editor;
  if (!selection) {
    return;
  }

  if (
    isElementActive(editor, ElementType.ExternalLink) ||
    isElementActive(editor, ElementType.NoteLink)
  ) {
    unwrapLink(editor);
  }

  const shouldInsertNode = selection && Range.isCollapsed(selection);
  if (shouldInsertNode) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

// Text is only used as the link text if the range is collapsed; otherwise, we reuse the existing selection text.
export const insertExternalLink = (
  editor: Editor,
  url: string,
  text?: string
) => {
  const { selection } = editor;
  if (!selection) {
    return;
  }

  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: ExternalLink = {
    id: createNodeId(),
    type: ElementType.ExternalLink,
    url,
    children: isCollapsed ? [{ text: text ?? url }] : [],
  };
  wrapLink(editor, link);
};

export const insertNoteLink = (
  editor: Editor,
  noteId: string,
  noteTitle: string
) => {
  const { selection } = editor;
  if (!selection) {
    return;
  }

  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: NoteLink = {
    id: createNodeId(),
    type: ElementType.NoteLink,
    noteId,
    noteTitle,
    customText: !isCollapsed ? Editor.string(editor, selection) : undefined,
    children: isCollapsed ? [{ text: noteTitle }] : [],
  };
  wrapLink(editor, link);
};

export const insertImage = (editor: Editor, url: string) => {
  const image: Image = {
    id: createNodeId(),
    type: ElementType.Image,
    url,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, image);
};

export const insertBlockReference = (
  editor: Editor,
  blockId: string,
  onOwnLine: boolean
) => {
  if (!editor.selection) {
    return;
  }

  const blockReference = computeBlockReference(store.getState().notes, blockId);
  const blockText = blockReference ? Node.string(blockReference.element) : '';

  const blockRef: BlockReference = {
    id: createNodeId(),
    type: ElementType.BlockReference,
    blockId,
    children: [{ text: blockText }],
  };

  if (onOwnLine) {
    // The block ref is on its own line
    Transforms.setNodes(editor, blockRef);
    Transforms.insertText(editor, blockText, {
      at: editor.selection.anchor.path,
      voids: true,
    }); // Children are not set with setNodes, so we need to insert the text manually
  } else {
    // There's other content on the same line
    Editor.insertNode(editor, blockRef);
  }
};
