import {
  Editor as SlateEditor,
  Element as SlateElement,
  Transforms,
} from 'slate';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

export const isMarkActive = (editor: SlateEditor, format: string) => {
  const [match] = SlateEditor.nodes(editor, {
    match: (n) => n[format] === true,
    mode: 'all',
  });
  return !!match;
};

export const toggleMark = (editor: SlateEditor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    SlateEditor.removeMark(editor, format);
  } else {
    SlateEditor.addMark(editor, format, true);
  }
};

export const isBlockActive = (editor: SlateEditor, format: string) => {
  const [match] = SlateEditor.nodes(editor, {
    match: (n) =>
      !SlateEditor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === format,
  });

  return !!match;
};

export const toggleBlock = (editor: SlateEditor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => {
      if (SlateEditor.isEditor(n) || !SlateElement.isElement(n)) {
        return false;
      }
      return LIST_TYPES.includes(n.type as string);
    },
    split: true,
  });
  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
