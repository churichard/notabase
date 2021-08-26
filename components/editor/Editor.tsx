import {
  useRef,
  useCallback,
  useMemo,
  useState,
  KeyboardEvent,
  useEffect,
} from 'react';
import {
  createEditor,
  Range,
  Editor as SlateEditor,
  Transforms,
  Descendant,
  Path,
} from 'slate';
import { withReact, Editable, ReactEditor, Slate } from 'slate-react';
import { withHistory } from 'slate-history';
import { isHotkey } from 'is-hotkey';
import colors from 'tailwindcss/colors';
import {
  handleEnter,
  handleIndent,
  handleUnindent,
  isElementActive,
  toggleElement,
  toggleMark,
} from 'editor/formatting';
import withAutoMarkdown from 'editor/plugins/withAutoMarkdown';
import withBlockBreakout from 'editor/plugins/withBlockBreakout';
import withLinks from 'editor/plugins/withLinks';
import withNormalization from 'editor/plugins/withNormalization';
import withCustomDeleteBackward from 'editor/plugins/withCustomDeleteBackward';
import withImages from 'editor/plugins/withImages';
import withVoidElements from 'editor/plugins/withVoidElements';
import withNodeId from 'editor/plugins/withNodeId';
import withBlockReferences from 'editor/plugins/withBlockReferences';
import { useStore } from 'lib/store';
import { ElementType, Mark } from 'types/slate';
import HoveringToolbar from './HoveringToolbar';
import AddLinkPopover from './AddLinkPopover';
import EditorElement from './elements/EditorElement';
import withVerticalSpacing from './elements/withVerticalSpacing';
import withBlockSideMenu from './elements/withBlockSideMenu';
import EditorLeaf, { EditorLeafProps } from './elements/EditorLeaf';
import LinkAutocompletePopover from './LinkAutocompletePopover';

export type AddLinkPopoverState = {
  isVisible: boolean;
  selection?: Range;
  isLink?: boolean;
};

type Props = {
  className?: string;
  value: Descendant[];
  setValue: (value: Descendant[]) => void;
  highlightedPath?: Path;
};

export default function Editor(props: Props) {
  const { className, value, setValue, highlightedPath } = props;

  const editorRef = useRef<SlateEditor>();
  if (!editorRef.current) {
    editorRef.current = withNormalization(
      withCustomDeleteBackward(
        withAutoMarkdown(
          withBlockBreakout(
            withVoidElements(
              withBlockReferences(
                withImages(
                  withLinks(withNodeId(withHistory(withReact(createEditor()))))
                )
              )
            )
          )
        )
      )
    );
  }
  const editor = editorRef.current;

  const renderElement = useMemo(() => {
    const ElementWithSideMenu = withBlockSideMenu(
      withVerticalSpacing(EditorElement)
    );
    return ElementWithSideMenu;
  }, []);
  const renderLeaf = useCallback(
    (props: EditorLeafProps) => <EditorLeaf {...props} />,
    []
  );

  const [addLinkPopoverState, setAddLinkPopoverState] =
    useState<AddLinkPopoverState>({
      isVisible: false,
      selection: undefined,
      isLink: false,
    });

  const [selection, setSelection] = useState(editor.selection);
  const [toolbarCanBeVisible, setToolbarCanBeVisible] = useState(true);
  const hasExpandedSelection = useMemo(
    () =>
      !!selection &&
      ReactEditor.isFocused(editor) &&
      !Range.isCollapsed(selection) &&
      SlateEditor.string(editor, selection, { voids: true }) !== '',
    [editor, selection]
  );
  const isToolbarVisible = useMemo(
    () =>
      toolbarCanBeVisible &&
      hasExpandedSelection &&
      !addLinkPopoverState.isVisible,
    [toolbarCanBeVisible, hasExpandedSelection, addLinkPopoverState.isVisible]
  );

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
        callback: () => toggleElement(editor, ElementType.Blockquote),
      },
      {
        hotkey: 'mod+shift+7',
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

  // If highlightedPath is defined, highlight the path
  const darkMode = useStore((state) => state.darkMode);
  useEffect(() => {
    if (!highlightedPath) {
      return;
    }

    try {
      // Scroll to line
      const [node] = SlateEditor.node(editor, highlightedPath);
      const domNode = ReactEditor.toDOMNode(editor, node);
      domNode.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Highlight line, but restore original color if mouse is clicked or component is re-rendered
      const originalBgColor = domNode.style.backgroundColor;
      const removeHighlight = () => {
        domNode.style.backgroundColor = originalBgColor;
      };

      domNode.style.backgroundColor = darkMode
        ? colors.yellow[800]
        : colors.yellow[200];
      domNode.addEventListener('click', removeHighlight, { once: true });

      return () => {
        removeHighlight();
        document.removeEventListener('click', removeHighlight);
      };
    } catch (e) {
      // Do nothing if an error occurs, which sometimes happens if the router changes before the editor does
    }
  }, [editor, highlightedPath, darkMode]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        setSelection(editor.selection);
      }}
    >
      {isToolbarVisible ? (
        <HoveringToolbar setAddLinkPopoverState={setAddLinkPopoverState} />
      ) : null}
      {addLinkPopoverState.isVisible ? (
        <AddLinkPopover
          addLinkPopoverState={addLinkPopoverState}
          setAddLinkPopoverState={setAddLinkPopoverState}
        />
      ) : null}
      <LinkAutocompletePopover />
      <Editable
        className={`overflow-hidden placeholder-gray-300 ${className}`}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Start typing here…"
        onKeyDown={onKeyDown}
        onMouseDown={() => setToolbarCanBeVisible(false)}
        onMouseUp={() => setTimeout(() => setToolbarCanBeVisible(true), 100)}
        spellCheck
      />
    </Slate>
  );
}
