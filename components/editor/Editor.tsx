import React, { KeyboardEvent, useCallback } from 'react';
import { Node, Transforms } from 'slate';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
} from 'slate-react';
import { isHotkey } from 'is-hotkey';
import { toggleMark } from 'editor/formatting';
import HoveringToolbar from './HoveringToolbar';

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

type Props = {
  className?: string;
  editor: ReactEditor;
  value: Array<Node>;
  setValue: (value: Array<Node>) => void;
};

export default function Editor(props: Props) {
  const { className, editor, value, setValue } = props;
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Handle keyboard shortcuts for adding marks
      for (const hotkey in HOTKEYS) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (isHotkey(hotkey, event as any)) {
          event.preventDefault();
          const mark = HOTKEYS[hotkey];
          toggleMark(editor, mark);
        }
      }

      // Handle breaking out of the current block element when the enter key is pressed
      if (event.key === 'Enter' && !event.shiftKey && editor.selection) {
        const breakoutElements = [
          'heading-one',
          'heading-two',
          'heading-three',
          'heading-four',
          'heading-five',
          'heading-six',
          'block-quote',
          'list-item',
        ];
        const selectedElement = Node.descendant(
          editor,
          editor.selection.anchor.path.slice(0, -1)
        );
        const selectedElementType = selectedElement.type as string;

        if (breakoutElements.includes(selectedElementType)) {
          const selectedLeaf = Node.descendant(
            editor,
            editor.selection.anchor.path
          );
          const selectedLeafText = selectedLeaf.text as string;

          // The element is a list item
          if (selectedElementType === 'list-item') {
            // We only want to insert a paragraph if there is no text content in the current bullet point
            if (selectedLeafText.length === 0) {
              event.preventDefault();
              // We remove the current list item and insert a paragraph
              Transforms.removeNodes(editor);
              Transforms.insertNodes(editor, {
                type: 'paragraph',
                children: [{ text: '', marks: [] }],
              });
              Transforms.liftNodes(editor);
            }
          }
          // The cursor is at the end of the text
          else if (selectedLeafText.length === editor.selection.anchor.offset) {
            event.preventDefault();
            // We insert a paragraph
            Transforms.insertNodes(editor, {
              type: 'paragraph',
              children: [{ text: '', marks: [] }],
            });
          }
          // The cursor is not at the end of the text
          else {
            event.preventDefault();
            // We insert a paragraph with the proper text
            Transforms.splitNodes(editor);
            Transforms.setNodes(editor, { type: 'paragraph' });
          }
        }
      }
    },
    [editor]
  );

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
        onKeyDown={onKeyDown}
        spellCheck
        autoFocus
      />
    </Slate>
  );
}

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'heading-one':
      return (
        <h1 className="my-2 text-2xl font-semibold" {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 className="my-2 text-xl font-semibold" {...attributes}>
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 className="my-2 text-lg font-semibold" {...attributes}>
          {children}
        </h3>
      );
    case 'heading-four':
      return (
        <h4 className="my-2 font-semibold" {...attributes}>
          {children}
        </h4>
      );
    case 'heading-five':
      return (
        <h5 className="my-2 font-semibold" {...attributes}>
          {children}
        </h5>
      );
    case 'heading-six':
      return (
        <h6 className="my-2 font-semibold" {...attributes}>
          {children}
        </h6>
      );
    case 'list-item':
      return (
        <li className="pl-1 my-2" {...attributes}>
          {children}
        </li>
      );
    case 'bulleted-list':
      return (
        <ul className="my-2 ml-8 list-disc" {...attributes}>
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol className="my-2 ml-8 list-decimal" {...attributes}>
          {children}
        </ol>
      );
    case 'block-quote':
      return (
        <blockquote className="pl-4 my-2 border-l-4" {...attributes}>
          {children}
        </blockquote>
      );
    default:
      return (
        <p className="my-2" {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <span className="font-semibold">{children}</span>;
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
