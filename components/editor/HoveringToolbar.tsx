import React, { useEffect, useMemo, useRef } from 'react';
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
import Portal from 'components/Portal';
import {
  toggleMark,
  isMarkActive,
  toggleBlock,
  isBlockActive,
  wrapLink,
} from 'editor/formatting';

export default function HoveringToolbar() {
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection) {
      return;
    }
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${rect.left + window.pageXOffset}px`;
  });

  return (
    <Portal selector="#hovering-toolbar">
      <div
        ref={ref}
        className="absolute z-10 flex items-stretch invisible -mt-2 overflow-hidden transition-opacity bg-white border rounded-md opacity-0"
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
      className="flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100"
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={(event) => {
        if (event.button === 0) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <Icon className={`${isActive ? 'text-primary-500' : 'text-gray-700'}`} />
      {text ? <span className="ml-1 text-sm text-gray-700">{text}</span> : null}
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
