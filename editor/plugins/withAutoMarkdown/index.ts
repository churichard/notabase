import { Editor, Element } from 'slate';
import { ElementType } from 'types/slate';
import handleBlockShortcuts from './handleBlockShortcuts';
import handleInlineShortcuts from './handleInlineShortcuts';

// Add auto-markdown formatting shortcuts
const withAutoMarkdown = (editor: Editor) => {
  const { insertText, insertData } = editor;

  editor.insertText = (text) => {
    const handled = handleAutoMarkdown(editor, text);
    if (!handled) {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');
    // TODO: make sure multiple markdown elements inserted in the same data are all handled
    const handled = handleAutoMarkdown(editor, text);
    if (!handled) {
      insertData(data);
    }
  };

  return editor;
};

const handleAutoMarkdown = (editor: Editor, text: string) => {
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
  const blockHandled = handleBlockShortcuts(editor, text);

  // Handle inline shortcuts
  const inlineHandled = handleInlineShortcuts(editor, text);

  return blockHandled || inlineHandled;
};

export default withAutoMarkdown;
