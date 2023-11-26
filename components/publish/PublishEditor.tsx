import { memo, useEffect, useMemo, useRef } from 'react';
import { Editor, Path , Descendant } from 'slate';
import { Editable, Slate } from 'slate-react';
import EditorLeaf from 'components/editor/elements/EditorLeaf';
import useHighlightedPath from 'editor/useHighlightedPath';
import createNotabaseEditor from 'editor/createEditor';
import withVerticalSpacing from 'components/editor/elements/withVerticalSpacing';
import { store } from 'lib/store';
import PublishEditorElement from './elements/PublishEditorElement';

type Props = {
  noteId: string;
  highlightedPath?: Path;
  className?: string;
};

function PublishEditor(props: Props) {
  const { noteId, highlightedPath, className } = props;

  const editorRef = useRef<Editor>();
  if (!editorRef.current) {
    editorRef.current = createNotabaseEditor();
  }
  const editor = editorRef.current;

  const initialValueRef = useRef<Descendant[]>();
  if (!initialValueRef.current) {
    initialValueRef.current = store.getState().notes[noteId].content;
  }
  const initialValue = initialValueRef.current;

  useEffect(() => {
    editor.children = store.getState().notes[noteId].content;
  }, [noteId, editor]);

  useHighlightedPath(editor, highlightedPath, false);

  const renderElement = useMemo(
    () => withVerticalSpacing(PublishEditorElement),
    []
  );

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
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
