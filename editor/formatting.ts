import { Editor, Element, Transforms, Range, Text, Node } from 'slate';
import type { ExternalLink, NoteLink, ListElement } from 'types/slate';
import { ElementType, Mark } from 'types/slate';

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

export const isElementActive = (editor: Editor, format: ElementType) => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
  });

  return !!match;
};

export const toggleElement = (editor: Editor, format: ElementType) => {
  const isActive = isElementActive(editor, format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && isListType(n.type),
    split: true,
  });
  const newProperties: Partial<Element> = {
    type: isActive
      ? ElementType.Paragraph
      : isListType(format)
      ? ElementType.ListItem
      : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isListType(format)) {
    const block: ListElement = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const handleIndent = (editor: Editor) => {
  if (isElementActive(editor, ElementType.BulletedList)) {
    Transforms.wrapNodes(editor, {
      type: ElementType.BulletedList,
      children: [],
    });
  } else if (isElementActive(editor, ElementType.NumberedList)) {
    Transforms.wrapNodes(editor, {
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
    type: ElementType.NoteLink,
    noteId,
    noteTitle,
    isTextTitle: isCollapsed,
    children: isCollapsed ? [{ text: noteTitle }] : [],
  };
  wrapLink(editor, link);
};
