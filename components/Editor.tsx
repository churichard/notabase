import React, { useMemo, useState } from 'react';
import { createEditor, Node } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';

export default function Editor() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Array<Node>>([
    {
      type: 'paragraph',
      children: [{ text: 'Start typing here...' }],
    },
  ]);

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <Editable className="w-full h-screen p-8" />
    </Slate>
  );
}
