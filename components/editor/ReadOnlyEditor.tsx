import { useRef } from 'react';
import { createEditor, Descendant, Editor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import withVoidElements from 'editor/plugins/withVoidElements';
import withLinks from 'editor/plugins/withLinks';
import { EditorElementProps } from './elements/EditorElement';
import { EditorLeafProps } from './elements/EditorLeaf';

type Props = {
  value: Descendant[];
  renderElement: (props: EditorElementProps) => JSX.Element;
  renderLeaf: (props: EditorLeafProps) => JSX.Element;
};

export function ReadOnlyEditor(props: Props) {
  const { value, renderElement, renderLeaf } = props;

  const editorRef = useRef<Editor>();
  if (!editorRef.current) {
    editorRef.current = withVoidElements(withLinks(withReact(createEditor())));
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
      <Editable
        className="pointer-events-none"
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        contentEditable={false}
        readOnly
      />
    </Slate>
  );
}
