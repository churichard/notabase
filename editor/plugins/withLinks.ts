import { Editor, Element, Node, Range, Transforms } from 'slate';
import isUrl from 'utils/isUrl';
import { insertExternalLink } from 'editor/formatting';
import { ElementType } from 'types/slate';

const withLinks = (editor: Editor) => {
  const { insertData, insertText, isInline, normalizeNode } = editor;

  editor.isInline = (element) => {
    return element.type === ElementType.ExternalLink ||
      element.type === ElementType.NoteLink
      ? true
      : isInline(element);
  };

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text && isUrl(text)) {
      insertExternalLink(editor, text);
    } else if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const start = Editor.start(editor, anchor.path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const beforeTextArr = beforeText.split(' ');
      const lastSegment = beforeTextArr[beforeTextArr.length - 1];

      // If the last text segment is a URL, convert it into a link
      if (lastSegment && isUrl(lastSegment)) {
        const lastSegmentRange = {
          anchor,
          focus: {
            path: anchor.path,
            offset: anchor.offset - lastSegment.length,
          },
        };
        Transforms.select(editor, lastSegmentRange);
        insertExternalLink(editor, lastSegment);
      }

      insertText(text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      insertExternalLink(editor, text);
    } else {
      insertData(data);
    }
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Remove links with no text
    if (Element.isElement(node)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (
          Element.isElement(child) &&
          (child.type === ElementType.NoteLink ||
            child.type === ElementType.ExternalLink) &&
          !Node.string(child)
        ) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};

export default withLinks;
