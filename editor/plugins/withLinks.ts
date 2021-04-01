import { Editor, Element, Node, Range, Transforms } from 'slate';
import isUrl from 'utils/isUrl';
import { insertLink } from 'editor/formatting';
import { ElementType } from 'types/slate';

const withLinks = (editor: Editor) => {
  const { insertData, insertText, isInline, normalizeNode } = editor;

  editor.isInline = (element) => {
    return element.type === ElementType.Link ? true : isInline(element);
  };

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text && isUrl(text)) {
      insertLink(editor, text);
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
        insertLink(editor, lastSegment);
      }

      insertText(text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      insertLink(editor, text);
    } else {
      insertData(data);
    }
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Remove empty links
    if (Element.isElement(node) && node.type === ElementType.Link) {
      const text = Node.string(node);
      if (!text || text.length === 0) {
        Transforms.removeNodes(editor, { at: path });
      }
    }

    normalizeNode(entry);
  };

  return editor;
};

export default withLinks;
