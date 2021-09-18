import { Editor, Element } from 'slate';
import { ElementType } from 'types/slate';
import handleBlockShortcuts from './handleBlockShortcuts';
import handleInlineShortcuts from './handleInlineShortcuts';

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

export default withAutoMarkdown;
