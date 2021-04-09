import React, {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Range, Editor as SlateEditor, Descendant } from 'slate';
import { Editable, ReactEditor, RenderLeafProps, Slate } from 'slate-react';
import { isHotkey } from 'is-hotkey';
import { useAtom } from 'jotai';
import { addLinkPopoverAtom } from 'editor/state';
import { isElementActive, toggleMark } from 'editor/formatting';
import useNoteLinks from 'editor/useNoteLinks';
import { ElementType, Mark } from 'types/slate';
import HoveringToolbar from './HoveringToolbar';
import AddLinkPopover from './AddLinkPopover';
import EditorElement from './EditorElement';

type Props = {
  className?: string;
  editor: SlateEditor;
  value: Descendant[];
  setValue: (value: Descendant[]) => void;
};

export default function Editor(props: Props) {
  const { className, editor, value, setValue } = props;
  useNoteLinks(editor, value);

  const renderElement = useCallback(
    (props) => <EditorElement {...props} />,
    []
  );
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const [addLinkPopoverState, setAddLinkPopoverState] = useAtom(
    addLinkPopoverAtom
  );

  const [toolbarCanBeVisible, setToolbarCanBeVisible] = useState(true);
  const hasExpandedSelection = useMemo(
    () =>
      !!editor.selection &&
      ReactEditor.isFocused(editor) &&
      !Range.isCollapsed(editor.selection) &&
      SlateEditor.string(editor, editor.selection) !== '',
    // We actually need editor.selection in order for this to re-compute properly
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, editor.selection]
  );
  const isToolbarVisible = useMemo(
    () => toolbarCanBeVisible && hasExpandedSelection,
    [toolbarCanBeVisible, hasExpandedSelection]
  );

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'mod+b',
        callback: (editor: SlateEditor) => toggleMark(editor, Mark.Bold),
      },
      {
        hotkey: 'mod+i',
        callback: (editor: SlateEditor) => toggleMark(editor, Mark.Italic),
      },
      {
        hotkey: 'mod+u',
        callback: (editor: SlateEditor) => toggleMark(editor, Mark.Underline),
      },
      {
        hotkey: 'mod+e',
        callback: (editor: SlateEditor) => toggleMark(editor, Mark.Code),
      },
      {
        hotkey: 'mod+k',
        callback: (editor: SlateEditor) => {
          if (editor.selection) {
            // Save the selection and make the add link popover visible
            setAddLinkPopoverState({
              isVisible: true,
              selection: editor.selection,
              isLink:
                isElementActive(editor, ElementType.ExternalLink) ||
                isElementActive(editor, ElementType.NoteLink),
            });
          }
        },
      },
    ],
    [setAddLinkPopoverState]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Handle keyboard shortcuts for adding marks
      for (const { hotkey, callback } of hotkeys) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (isHotkey(hotkey, event as any)) {
          event.preventDefault();
          callback(editor);
        }
      }
    },
    [editor, hotkeys]
  );

  const onSelect = useCallback(
    (event: KeyboardEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => {
      /**
       * Add auto scrolling on type
       * Adapted from https://github.com/ianstormtaylor/slate/issues/3750
       */
      if (
        !editor.selection ||
        event.nativeEvent.type === 'keyup' ||
        event.nativeEvent.altKey ||
        event.nativeEvent.metaKey ||
        event.nativeEvent.ctrlKey
      ) {
        // Don't auto scroll
        return;
      }
      try {
        /**
         * Need a try/catch because sometimes you get an error like:
         *
         * Error: Cannot resolve a DOM node from Slate node: {"type":"p","children":[{"text":"","by":-1,"at":-1}]}
         */
        const domPoint = ReactEditor.toDOMPoint(editor, editor.selection.focus);
        const node = domPoint[0];
        if (!node) return;
        const element = node.parentElement;
        if (!element) return;
        element.scrollIntoView({ block: 'nearest' });
      } catch (e) {
        /**
         * Empty catch. Do nothing if there is an error.
         */
      }
    },
    [editor]
  );

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      {isToolbarVisible ? <HoveringToolbar /> : null}
      {addLinkPopoverState.isVisible ? <AddLinkPopover /> : null}
      <Editable
        className={`placeholder-gray-300 ${className}`}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Start typing here…"
        onKeyDown={onKeyDown}
        onSelect={onSelect}
        onMouseDown={() => setToolbarCanBeVisible(false)}
        onMouseUp={() => setTimeout(() => setToolbarCanBeVisible(true), 100)}
        spellCheck
        autoFocus
      />
    </Slate>
  );
}

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <span className="font-semibold">{children}</span>;
  }

  if (leaf.code) {
    children = <code className="bg-gray-200">{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};
