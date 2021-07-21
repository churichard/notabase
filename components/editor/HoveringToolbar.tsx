import { useMemo } from 'react';
import { useSlate } from 'slate-react';
import type { TablerIcon } from '@tabler/icons';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconBlockquote,
  IconList,
  IconListNumbers,
  IconLink,
  IconBraces,
} from '@tabler/icons';
import Tippy from '@tippyjs/react';
import {
  toggleMark,
  isMarkActive,
  toggleElement,
  isElementActive,
} from 'editor/formatting';
import { ElementType, Mark } from 'types/slate';
import Popover from './Popover';
import type { AddLinkPopoverState } from './Editor';

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
      <FormatButton format={Mark.Strikethrough} />
      <FormatButton format={Mark.Code} className="border-r" />
      <BlockButton format={ElementType.HeadingOne} />
      <BlockButton format={ElementType.HeadingTwo} />
      <BlockButton format={ElementType.HeadingThree} />
      <BlockButton format={ElementType.BulletedList} />
      <BlockButton format={ElementType.NumberedList} />
      <BlockButton format={ElementType.Blockquote} />
      <BlockButton format={ElementType.CodeBlock} />
    </Popover>
  );
}

type ToolbarButtonProps = {
  icon: TablerIcon;
  onClick: () => void;
  text?: string;
  tooltip?: string;
  isActive?: boolean;
  className?: string;
};

const ToolbarButton = (props: ToolbarButtonProps) => {
  const {
    icon: Icon,
    onClick,
    text,
    tooltip,
    isActive = false,
    className = '',
  } = props;

  return (
    <Tippy
      content={tooltip}
      duration={0}
      placement="top"
      arrow={false}
      offset={[0, 6]}
      disabled={!tooltip}
    >
      <span
        className={`flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100 active:bg-gray-200 ${
          isActive ? 'text-primary-500' : 'text-gray-800'
        } ${className}`}
        onMouseDown={(event) => event.preventDefault()}
        onMouseUp={(event) => {
          if (event.button === 0) {
            event.preventDefault();
            onClick();
          }
        }}
      >
        <Icon size={18} />
        {text ? (
          <span className="ml-1 text-sm tracking-wide">{text}</span>
        ) : null}
      </span>
    </Tippy>
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
        return IconBold;
      case Mark.Italic:
        return IconItalic;
      case Mark.Underline:
        return IconUnderline;
      case Mark.Strikethrough:
        return IconStrikethrough;
      case Mark.Code:
        return IconCode;
      default:
        throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  const tooltip = useMemo(() => {
    switch (format) {
      case Mark.Bold:
        return 'Bold';
      case Mark.Italic:
        return 'Italic';
      case Mark.Underline:
        return 'Underline';
      case Mark.Strikethrough:
        return 'Strikethrough';
      case Mark.Code:
        return 'Code';
      default:
        return undefined;
    }
  }, [format]);

  return (
    <ToolbarButton
      icon={Icon}
      onClick={() => toggleMark(editor, format)}
      isActive={isActive}
      className={className}
      tooltip={tooltip}
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
        return IconH1;
      case ElementType.HeadingTwo:
        return IconH2;
      case ElementType.HeadingThree:
        return IconH3;
      case ElementType.BulletedList:
        return IconList;
      case ElementType.NumberedList:
        return IconListNumbers;
      case ElementType.Blockquote:
        return IconBlockquote;
      case ElementType.CodeBlock:
        return IconBraces;
      default:
        throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  const tooltip = useMemo(() => {
    switch (format) {
      case ElementType.HeadingOne:
        return 'Heading 1';
      case ElementType.HeadingTwo:
        return 'Heading 2';
      case ElementType.HeadingThree:
        return 'Heading 3';
      case ElementType.BulletedList:
        return 'Bulleted List';
      case ElementType.NumberedList:
        return 'Numbered List';
      case ElementType.Blockquote:
        return 'Quote Block';
      case ElementType.CodeBlock:
        return 'Code Block';
      default:
        return undefined;
    }
  }, [format]);

  return (
    <ToolbarButton
      icon={Icon}
      onClick={() => toggleElement(editor, format)}
      isActive={isActive}
      className={className}
      tooltip={tooltip}
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
      icon={IconLink}
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
      tooltip="Link to a note or web page"
    />
  );
};
