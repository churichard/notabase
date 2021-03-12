import { Editor as SlateEditor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import isUrl from 'helper/isUrl';
import { wrapLink } from 'editor/formatting';

const withLinks = (editor: ReactEditor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) => {
    return element.type === 'link' ? true : isInline(element);
  };

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const start = SlateEditor.start(editor, anchor.path);
      const range = { anchor, focus: start };
      const beforeText = SlateEditor.string(editor, range);
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
        wrapLink(editor, lastSegment);
      }

      insertText(text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export default withLinks;
