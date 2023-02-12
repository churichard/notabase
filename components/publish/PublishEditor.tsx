import { memo, useEffect, useMemo, useRef } from 'react';
import { Editor, Path } from 'slate';
import { Editable, Slate } from 'slate-react';
import EditorLeaf from 'components/editor/elements/EditorLeaf';
import { PublishNote } from 'pages/publish/note/[id]';
import useHighlightedPath from 'editor/useHighlightedPath';
import createNotabaseEditor from 'editor/createEditor';
import withVerticalSpacing from 'components/editor/elements/withVerticalSpacing';
import PublishEditorElement from './elements/PublishEditorElement';

type Props = {
  note: PublishNote;
  highlightedPath?: Path;
  className?: string;
};

function PublishEditor(props: Props) {
  const { note, highlightedPath, className } = props;

  const editorRef = useRef<Editor>();
  if (!editorRef.current) {
    editorRef.current = createNotabaseEditor();
  }
  const editor = editorRef.current;

  useEffect(() => {
    editor.children = note.content;
  }, [editor, note.content]);

  useHighlightedPath(editor, highlightedPath, false);

  const renderElement = useMemo(
    () => withVerticalSpacing(PublishEditorElement),
    []
  );

  return (
    <Slate
      editor={editor}
      value={note.content}
      onChange={() => {
        /* Do nothing, this is a read only editor */
      }}
    >
      <div contentEditable={false} className={className}>
        <Editable
          renderElement={renderElement}
          renderLeaf={EditorLeaf}
          readOnly
        />
      </div>
    </Slate>
  );
}

export default memo(PublishEditor);
