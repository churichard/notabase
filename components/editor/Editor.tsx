import {
  useRef,
  useCallback,
  useMemo,
  useState,
  KeyboardEvent,
  memo,
  useSyncExternalStore,
} from 'react';
import { Range, Transforms, Descendant, Path } from 'slate';
import { Editable, Slate } from 'slate-react';
import { isHotkey } from 'is-hotkey';
import {
  handleEnter,
  handleIndent,
  handleUnindent,
  isElementActive,
  toggleElement,
  toggleMark,
} from 'editor/formatting';
import { getDefaultEditorValue } from 'editor/constants';
import { store, useStore } from 'lib/store';
import { ElementType, Mark } from 'types/slate';
import useIsMounted from 'utils/useIsMounted';
import activeEditorsStore from 'lib/activeEditorsStore';
import useHighlightedPath from 'editor/useHighlightedPath';
import HoveringToolbar from './toolbar/HoveringToolbar';
import AddLinkPopover from './AddLinkPopover';
import EditorElement from './elements/EditorElement';
import withVerticalSpacing from './elements/withVerticalSpacing';
import withBlockSideMenu from './blockmenu/withBlockSideMenu';
import EditorLeaf from './elements/EditorLeaf';
import LinkAutocompletePopover from './LinkAutocompletePopover';
import BlockAutocompletePopover from './BlockAutocompletePopover';
import TagAutocompletePopover from './TagAutocompletePopover';

export type AddLinkPopoverState = {
  isVisible: boolean;
  selection?: Range;
  isLink?: boolean;
};

type Props = {
  noteId: string;
  onChange: (value: Descendant[]) => void;
  className?: string;
  highlightedPath?: Path;
};

function Editor(props: Props) {
  const { noteId, onChange, className = '', highlightedPath } = props;
  const isMounted = useIsMounted();

  const updateStoreNote = useCallback(
    (value: Descendant[]) =>
      store.getState().updateNote({ id: noteId, content: value }),
    [noteId]
  );

  const initialValueRef = useRef<Descendant[]>();
  if (!initialValueRef.current) {
    activeEditorsStore.addActiveEditor(noteId);
    initialValueRef.current =
      store.getState().notes[noteId]?.content ?? getDefaultEditorValue();
  }
  const initialValue = initialValueRef.current;

  const editor = useSyncExternalStore(activeEditorsStore.subscribe, () =>
    activeEditorsStore.getActiveEditor(noteId)
  );

  const renderElement = useMemo(() => {
    const ElementWithSideMenu = withBlockSideMenu(
      withVerticalSpacing(EditorElement)
    );
    return ElementWithSideMenu;
  }, []);

  const [addLinkPopoverState, setAddLinkPopoverState] =
    useState<AddLinkPopoverState>({
      isVisible: false,
      selection: undefined,
      isLink: false,
    });

  const [toolbarCanBeVisible, setToolbarCanBeVisible] = useState(true);

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'mod+b',
        callback: () => toggleMark(editor, Mark.Bold),
      },
      {
        hotkey: 'mod+i',
        callback: () => toggleMark(editor, Mark.Italic),
      },
      {
        hotkey: 'mod+u',
        callback: () => toggleMark(editor, Mark.Underline),
      },
      {
        hotkey: 'mod+`',
        callback: () => toggleMark(editor, Mark.Code),
      },
      {
        hotkey: 'mod+shift+s',
        callback: () => toggleMark(editor, Mark.Strikethrough),
      },
      {
        hotkey: 'mod+shift+h',
        callback: () => toggleMark(editor, Mark.Highlight),
      },
      {
        hotkey: 'mod+shift+1',
        callback: () => toggleElement(editor, ElementType.HeadingOne),
      },
      {
        hotkey: 'mod+shift+2',
        callback: () => toggleElement(editor, ElementType.HeadingTwo),
      },
      {
        hotkey: 'mod+shift+3',
        callback: () => toggleElement(editor, ElementType.HeadingThree),
      },
      {
        hotkey: 'mod+shift+4',
        callback: () => toggleElement(editor, ElementType.BulletedList),
      },
      {
        hotkey: 'mod+shift+5',
        callback: () => toggleElement(editor, ElementType.NumberedList),
      },
      {
        hotkey: 'mod+shift+6',
        callback: () => toggleElement(editor, ElementType.CheckListItem),
      },
      {
        hotkey: 'mod+shift+7',
        callback: () => toggleElement(editor, ElementType.Blockquote),
      },
      {
        hotkey: 'mod+shift+8',
        callback: () => toggleElement(editor, ElementType.CodeBlock),
      },
      {
        hotkey: 'mod+shift+9',
        callback: () => toggleElement(editor, ElementType.Paragraph),
      },
      {
        hotkey: 'mod+k',
        callback: () => {
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
      {
        hotkey: 'tab',
        callback: () => handleIndent(editor),
      },
      {
        hotkey: 'shift+tab',
        callback: () => handleUnindent(editor),
      },
      {
        hotkey: 'enter',
        callback: () => handleEnter(editor),
      },
      {
        hotkey: 'shift+enter',
        callback: () => Transforms.insertText(editor, '\n'),
      },
      {
        hotkey: 'mod+enter',
        callback: () => editor.insertBreak(),
      },
    ],
    [editor, setAddLinkPopoverState]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Handle keyboard shortcuts for adding marks
      for (const { hotkey, callback } of hotkeys) {
        if (isHotkey(hotkey, event.nativeEvent)) {
          event.preventDefault();
          callback();
        }
      }
    },
    [hotkeys]
  );

  const onSlateChange = useCallback(
    (newValue: Descendant[]) => {
      // Check if there are changes other than the selection
      const isAstChange = editor.operations.some(
        (op) => 'set_selection' !== op.type
      );
      if (isAstChange) {
        updateStoreNote(newValue);
        onChange(newValue);
      }
    },
    [editor.operations, updateStoreNote, onChange]
  );

  // If highlightedPath is defined, highlight the path
  const darkMode = useStore((state) => state.darkMode);
  useHighlightedPath(editor, highlightedPath, darkMode);

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={onSlateChange}>
      <HoveringToolbar
        canBeVisible={toolbarCanBeVisible && !addLinkPopoverState.isVisible}
        setAddLinkPopoverState={setAddLinkPopoverState}
      />
      {addLinkPopoverState.isVisible ? (
        <AddLinkPopover
          addLinkPopoverState={addLinkPopoverState}
          setAddLinkPopoverState={setAddLinkPopoverState}
        />
      ) : null}
      <LinkAutocompletePopover />
      <BlockAutocompletePopover />
      <TagAutocompletePopover />
      <Editable
        className={`overflow-hidden placeholder-gray-300 focus:outline-none ${className}`}
        data-testid="note-editor"
        renderElement={renderElement}
        renderLeaf={EditorLeaf}
        placeholder="Start typing here…"
        onKeyDown={onKeyDown}
        onPointerDown={() => setToolbarCanBeVisible(false)}
        onPointerUp={() =>
          setTimeout(() => {
            if (isMounted()) setToolbarCanBeVisible(true);
          }, 100)
        }
        spellCheck
      />
    </Slate>
  );
}

export default memo(Editor);
