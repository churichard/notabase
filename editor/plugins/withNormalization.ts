import { Editor, Element, Node, Selection, Text, Transforms } from 'slate';
import { ElementType, Mark, ParagraphElement } from 'types/slate';
import { isListType } from 'editor/formatting';
import { isTextType } from 'editor/checks';
import { createNodeId } from './withNodeId';

const withNormalization = (editor: Editor) => {
  return withListNormalization(
    withInlineNormalization(withLayoutNormalization(editor))
  );
};

const withLayoutNormalization = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [, path] = entry;

    // Make sure there is at least a paragraph in the editor
    if (path.length === 0) {
      if (editor.children.length < 1) {
        const paragraph: ParagraphElement = {
          id: createNodeId(),
          type: ElementType.Paragraph,
          children: [{ text: '' }],
        };
        Transforms.insertNodes(editor, paragraph, { at: path.concat(0) });
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};

const withInlineNormalization = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (Element.isElement(node)) {
      const markArr = Object.values(Mark);

      for (const [child, childPath] of Node.children(editor, path)) {
        let normalized = false;

        // Inline, non-void elements with no text should be unwrapped
        if (
          Element.isElement(child) &&
          editor.isInline(child) &&
          !editor.isVoid(child) &&
          !Node.string(child)
        ) {
          Transforms.unwrapNodes(editor, { at: childPath });
          normalized = true;
        }
        // Text elements with no text and a mark should have their mark unset
        else if (
          Text.isText(child) &&
          !Node.string(child) &&
          markArr.some((mark) => !!child[mark])
        ) {
          Transforms.unsetNodes(editor, markArr, { at: childPath });
          normalized = true;
        }

        if (normalized) {
          if (!isAtLineEnd(editor, editor.selection)) {
            // This ensures the selection doesn't move to the previous line
            Transforms.move(editor, { distance: 1, unit: 'offset' });
          }
          return;
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};

const withListNormalization = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Paragraphs, headings, and list items in list items should be stripped out
    if (Element.isElement(node) && node.type === ElementType.ListItem) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (
          Element.isElement(child) &&
          (isTextType(child.type) || child.type === ElementType.ListItem)
        ) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    // Convert paragraphs and headings to list items if they are the children of a list
    if (Element.isElement(node) && isListType(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && isTextType(child.type)) {
          Transforms.setNodes(
            editor,
            { type: ElementType.ListItem },
            { at: childPath }
          );
          return;
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};

const isAtLineEnd = (editor: Editor, selection: Selection) => {
  if (!selection) {
    return false;
  }

  const { anchor } = selection;
  const block = Editor.above(editor, {
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
  });
  const linePath = block ? block[1] : [];

  return Editor.isEnd(editor, anchor, linePath);
};

export default withNormalization;
