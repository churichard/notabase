import React, { useEffect, useMemo, useState } from 'react';
import { useSlate, ReactEditor } from 'slate-react';
import { Editor, Range } from 'slate';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  Header1Icon,
  Header2Icon,
  Header3Icon,
  RightDoubleQuoteIcon,
  BulletedListIcon,
  NumberedListIcon,
  LinkIcon,
} from '@fluentui/react-icons';
import { usePopper } from 'react-popper';
import { VirtualElement } from '@popperjs/core';
import Portal from 'components/Portal';
import {
  toggleMark,
  isMarkActive,
  toggleBlock,
  isBlockActive,
  wrapLink,
} from 'editor/formatting';

export default function HoveringToolbar() {
  const [referenceElement, setReferenceElement] = useState<
    Element | VirtualElement | null
  >(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top-start',
    modifiers: [
      { name: 'offset', options: { offset: [0, 8] } },
      // We need to disable gpu acceleration in order to fix text selection breaking
      { name: 'computeStyles', options: { gpuAcceleration: false } },
    ],
  });
  const editor = useSlate();

  useEffect(() => {
    const { onChange } = editor;

    editor.onChange = () => {
      if (!popperElement) {
        onChange();
        return;
      }

      const { selection } = editor;
      if (
        !selection ||
        !ReactEditor.isFocused(editor) ||
        Range.isCollapsed(selection) ||
        Editor.string(editor, selection) === ''
      ) {
        // Hide the toolbar if no text is being selected
        popperElement.style.opacity = '0';
        popperElement.style.visibility = 'hidden';
        onChange();
        return;
      }

      const domSelection = window.getSelection();
      const domRange = domSelection?.getRangeAt(0);
      const parentElement = domRange?.startContainer.parentElement;

      // Set the toolbar position
      const virtualElement = {
        getBoundingClientRect: getSelectionBoundingClientRect,
        contextElement: parentElement ?? undefined,
      };
      setReferenceElement(virtualElement);

      // Show the toolbar
      popperElement.style.opacity = '1';
      popperElement.style.visibility = 'visible';

      onChange();
    };
  }, [editor, popperElement]);

  return (
    <Portal>
      <div
        ref={setPopperElement}
        className="z-10 flex items-stretch invisible overflow-hidden transition-opacity bg-white border rounded-md opacity-0"
        style={styles.popper}
        {...attributes.popper}
      >
        <LinkButton />
        <FormatButton format="bold" />
        <FormatButton format="italic" />
        <FormatButton format="underline" />
        <FormatButton format="code" />
        <BlockButton format="heading-one" />
        <BlockButton format="heading-two" />
        <BlockButton format="heading-three" />
        <BlockButton format="bulleted-list" />
        <BlockButton format="numbered-list" />
        <BlockButton format="block-quote" />
        <style jsx>{`
          & {
            box-shadow: rgb(15 15 15 / 10%) 0px 3px 6px,
              rgb(15 15 15 / 20%) 0px 9px 24px;
          }
        `}</style>
      </div>
    </Portal>
  );
}

// Returns a DOM rect corresponding to the current editor text selection
const getSelectionBoundingClientRect = () => {
  const domSelection = window.getSelection();
  const domRange = domSelection?.getRangeAt(0);
  const rect = domRange?.getBoundingClientRect();
  return rect ?? new DOMRect();
};

type ToolbarButtonProps = {
  format: FormatButtonProps['format'] | BlockButtonProps['format'] | 'link';
  onClick: () => void;
  text?: string;
  isActive?: boolean;
};

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { format, onClick, text, isActive = false } = props;

  const Icon = useMemo(() => {
    switch (format) {
      case 'bold':
        return BoldIcon;
      case 'italic':
        return ItalicIcon;
      case 'underline':
        return UnderlineIcon;
      case 'code':
        return CodeIcon;
      case 'heading-one':
        return Header1Icon;
      case 'heading-two':
        return Header2Icon;
      case 'heading-three':
        return Header3Icon;
      case 'bulleted-list':
        return BulletedListIcon;
      case 'numbered-list':
        return NumberedListIcon;
      case 'block-quote':
        return RightDoubleQuoteIcon;
      case 'link':
        return LinkIcon;
      default:
        throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  return (
    <span
      className="flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100 active:bg-gray-200"
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={(event) => {
        if (event.button === 0) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <Icon className={`${isActive ? 'text-primary-500' : 'text-gray-700'}`} />
      {text ? (
        <span
          className={`ml-1 text-sm ${
            isActive ? 'text-primary-500' : 'text-gray-700'
          }`}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
};

type FormatButtonProps = {
  format: 'bold' | 'italic' | 'underline' | 'code';
};

const FormatButton = ({ format }: FormatButtonProps) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <ToolbarButton
      format={format}
      onClick={() => toggleMark(editor, format)}
      isActive={isActive}
    />
  );
};

type BlockButtonProps = {
  format:
    | 'heading-one'
    | 'heading-two'
    | 'heading-three'
    | 'bulleted-list'
    | 'numbered-list'
    | 'block-quote';
};

const BlockButton = ({ format }: BlockButtonProps) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);

  return (
    <ToolbarButton
      format={format}
      onClick={() => toggleBlock(editor, format)}
      isActive={isActive}
    />
  );
};

const insertLink = (editor: ReactEditor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

const LinkButton = () => {
  const editor = useSlate();
  const format = 'link';
  const isActive = isBlockActive(editor, format);

  return (
    <ToolbarButton
      format={format}
      onClick={() => {
        const url = window.prompt('Enter link URL:');
        if (!url) return;
        insertLink(editor, url);
      }}
      text="Link"
      isActive={isActive}
    />
  );
};
