import React, { useMemo } from 'react';
import { useSlate } from 'slate-react';
import { useAtom } from 'jotai';
import {
  TextBold16Regular as BoldIcon,
  TextItalic16Regular as ItalicIcon,
  TextUnderline16Regular as UnderlineIcon,
  Code20Regular as CodeIcon,
  TextHeader120Regular as Header1Icon,
  TextHeader220Regular as Header2Icon,
  TextHeader320Regular as Header3Icon,
  TextQuote20Filled as QuoteIcon,
  TextBulletListLtr20Regular as BulletedListIcon,
  TextNumberListLtr20Regular as NumberedListIcon,
  Link20Regular as LinkIcon,
} from '@fluentui/react-icons';
import {
  toggleMark,
  isMarkActive,
  toggleBlock,
  isBlockActive,
} from 'editor/formatting';
import { addLinkPopoverAtom } from 'editor/state';
import Popover from './Popover';

export default function HoveringToolbar() {
  return (
    <Popover placement="top-start">
      <LinkButton className="border-r" />
      <FormatButton format="bold" />
      <FormatButton format="italic" />
      <FormatButton format="underline" />
      <FormatButton format="code" className="border-r" />
      <BlockButton format="heading-one" />
      <BlockButton format="heading-two" />
      <BlockButton format="heading-three" />
      <BlockButton format="bulleted-list" />
      <BlockButton format="numbered-list" />
      <BlockButton format="block-quote" />
    </Popover>
  );
}

type ToolbarButtonProps = {
  format: FormatButtonProps['format'] | BlockButtonProps['format'] | 'link';
  onClick: () => void;
  text?: string;
  isActive?: boolean;
  className?: string;
};

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { format, onClick, text, isActive = false, className = '' } = props;

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
        return QuoteIcon;
      case 'link':
        return LinkIcon;
      default:
        throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  return (
    <span
      className={`flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100 active:bg-gray-200 ${className}`}
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={(event) => {
        if (event.button === 0) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <Icon
        primaryFill={
          isActive ? 'var(--color-primary-500)' : 'var(--color-gray-700)'
        }
      />
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
  className?: string;
};

const FormatButton = ({ format, className = '' }: FormatButtonProps) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <ToolbarButton
      format={format}
      onClick={() => toggleMark(editor, format)}
      isActive={isActive}
      className={className}
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
  className?: string;
};

const BlockButton = ({ format, className = '' }: BlockButtonProps) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);

  return (
    <ToolbarButton
      format={format}
      onClick={() => toggleBlock(editor, format)}
      isActive={isActive}
      className={className}
    />
  );
};

type LinkButtonProps = {
  className?: string;
};

const LinkButton = ({ className = '' }: LinkButtonProps) => {
  const editor = useSlate();
  const [, setAddLinkPopoverState] = useAtom(addLinkPopoverAtom);
  const isActive = isBlockActive(editor, 'link');

  return (
    <ToolbarButton
      format="link"
      onClick={() => {
        if (editor.selection) {
          // Save the selection and make the add link popover visible
          setAddLinkPopoverState({
            isVisible: true,
            selection: editor.selection,
          });
        }
      }}
      text="Link"
      isActive={isActive}
      className={className}
    />
  );
};
