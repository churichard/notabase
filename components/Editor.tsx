import React, { useMemo, useState } from 'react';
import { createEditor, Node } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';

export default function Editor() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Array<Node>>([
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    },
  ]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <Editable />
    </Slate>
  );
}
