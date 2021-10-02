import { memo, useRef } from 'react';
import { createEditor, Descendant, Editor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import withVoidElements from 'editor/plugins/withVoidElements';
import withLinks from 'editor/plugins/withLinks';
import withTags from 'editor/plugins/withTags';
import { EditorElementProps } from './elements/EditorElement';
import { EditorLeafProps } from './elements/EditorLeaf';

type Props = {
  value: Descendant[];
  renderElement: (props: EditorElementProps) => JSX.Element;
  renderLeaf: (props: EditorLeafProps) => JSX.Element;
};

function ReadOnlyEditor(props: Props) {
  const { value, renderElement, renderLeaf } = props;

  const editorRef = useRef<Editor>();
  if (!editorRef.current) {
    editorRef.current = withVoidElements(
      withTags(withLinks(withReact(createEditor())))
    );
  }
  const editor = editorRef.current;

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={() => {
        /* Do nothing, this is a read only editor */
      }}
    >
      <div contentEditable={false}>
        <Editable
          className="pointer-events-none"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          readOnly
        />
      </div>
    </Slate>
  );
}

export default memo(ReadOnlyEditor);
