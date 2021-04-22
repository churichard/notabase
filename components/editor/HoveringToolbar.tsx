import React, { useMemo } from 'react';
import { useSlate } from 'slate-react';
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
  IFluentIconsProps,
} from '@fluentui/react-icons';
import {
  toggleMark,
  isMarkActive,
  toggleElement,
  isElementActive,
} from 'editor/formatting';
import { ElementType, Mark } from 'types/slate';
import Popover from './Popover';
import { AddLinkPopoverState } from './Editor';

type Props = {
  setAddLinkPopoverState: (state: AddLinkPopoverState) => void;
};
export default function HoveringToolbar(props: Props) {
  const { setAddLinkPopoverState } = props;
  return (
    <Popover placement="top-start">
      <LinkButton
        setAddLinkPopoverState={setAddLinkPopoverState}
        className="border-r"
      />
      <FormatButton format={Mark.Bold} />
      <FormatButton format={Mark.Italic} />
      <FormatButton format={Mark.Underline} />
      <FormatButton format={Mark.Code} className="border-r" />
      <BlockButton format={ElementType.HeadingOne} />
      <BlockButton format={ElementType.HeadingTwo} />
      <BlockButton format={ElementType.HeadingThree} />
      <BlockButton format={ElementType.BulletedList} />
      <BlockButton format={ElementType.NumberedList} />
      <BlockButton format={ElementType.Blockquote} />
    </Popover>
  );
}

type ToolbarButtonProps = {
  icon: (props: IFluentIconsProps) => JSX.Element;
  onClick: () => void;
  text?: string;
  isActive?: boolean;
  className?: string;
};

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { icon: Icon, onClick, text, isActive = false, className = '' } = props;
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
  format: Mark;
  className?: string;
};

const FormatButton = ({ format, className = '' }: FormatButtonProps) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  const Icon = useMemo(() => {
    switch (format) {
      case Mark.Bold:
        return BoldIcon;
      case Mark.Italic:
        return ItalicIcon;
      case Mark.Underline:
        return UnderlineIcon;
      case Mark.Code:
        return CodeIcon;
      default:
        throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  return (
    <ToolbarButton
      icon={Icon}
      onClick={() => toggleMark(editor, format)}
      isActive={isActive}
      className={className}
    />
  );
};

type BlockButtonProps = {
  format: ElementType;
  className?: string;
};

const BlockButton = ({ format, className = '' }: BlockButtonProps) => {
  const editor = useSlate();
  const isActive = isElementActive(editor, format);

  const Icon = useMemo(() => {
    switch (format) {
      case ElementType.HeadingOne:
        return Header1Icon;
      case ElementType.HeadingTwo:
        return Header2Icon;
      case ElementType.HeadingThree:
        return Header3Icon;
      case ElementType.BulletedList:
        return BulletedListIcon;
      case ElementType.NumberedList:
        return NumberedListIcon;
      case ElementType.Blockquote:
        return QuoteIcon;
      default:
        throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  return (
    <ToolbarButton
      icon={Icon}
      onClick={() => toggleElement(editor, format)}
      isActive={isActive}
      className={className}
    />
  );
};

type LinkButtonProps = {
  setAddLinkPopoverState: (state: AddLinkPopoverState) => void;
  className?: string;
};

const LinkButton = (props: LinkButtonProps) => {
  const { setAddLinkPopoverState, className = '' } = props;
  const editor = useSlate();
  const isActive =
    isElementActive(editor, ElementType.ExternalLink) ||
    isElementActive(editor, ElementType.NoteLink);

  return (
    <ToolbarButton
      icon={LinkIcon}
      onClick={() => {
        if (editor.selection) {
          // Save the selection and make the add link popover visible
          setAddLinkPopoverState({
            isVisible: true,
            selection: editor.selection,
            isLink: isActive,
          });
        }
      }}
      text="Link"
      isActive={isActive}
      className={className}
    />
  );
};
