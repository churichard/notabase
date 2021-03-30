import { Editor, Element, Transforms, Range, Text, Node } from 'slate';
import { ElementType, ListElement, Mark } from 'types/slate';

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

export const removeLink = (editor: Editor) => {
  unwrapLink(editor);
  Transforms.collapse(editor, { edge: 'end' });
};

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      Element.isElement(n) &&
      n.type === ElementType.Link,
  });
};

export const insertLink = (editor: Editor, url: string, text?: string) => {
  const { selection } = editor;
  if (!selection) {
    return;
  }

  if (isElementActive(editor, ElementType.Link)) {
    unwrapLink(editor);
  }

  const isCollapsed = selection && Range.isCollapsed(selection);
  const shouldInsertNode = isCollapsed || text;
  const link: Node = {
    type: ElementType.Link,
    url,
    children: shouldInsertNode ? [{ text: text ?? url }] : [],
  };

  if (shouldInsertNode) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};
