import React, { useCallback, useMemo } from 'react';
import { createEditor, Node } from 'slate';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from 'slate-react';
import { withHistory } from 'slate-history';
import { isHotkey } from 'is-hotkey';
import { toggleMark } from 'helper/editor';
import HoveringToolbar from './HoveringToolbar';

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

type Props = {
  className?: string;
  value: Array<Node>;
  setValue: (value: Array<Node>) => void;
};

export default function Editor(props: Props) {
  const { className, value, setValue } = props;
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <div id="hovering-toolbar">
        <HoveringToolbar />
      </div>
      <Editable
        className={`placeholder-gray-300 ${className}`}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Start typing here…"
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (isHotkey(hotkey, event as any)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
}

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'heading-one':
      return (
        <h1 className="mb-2 text-2xl" {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 className="mb-2 text-xl" {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li className="pl-1" {...attributes}>
          {children}
        </li>
      );
    case 'bulleted-list':
      return (
        <ul className="ml-8 list-disc" {...attributes}>
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol className="ml-8 list-decimal" {...attributes}>
          {children}
        </ol>
      );
    case 'block-quote':
      return (
        <blockquote className="pl-4 my-4 border-l-4" {...attributes}>
          {children}
        </blockquote>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};
