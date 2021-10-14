import { useSlate } from 'slate-react';
import {
  TablerIcon,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconLink,
  IconEraser,
} from '@tabler/icons';
import { toggleMark, isMarkActive, isElementActive } from 'editor/formatting';
import { ElementType, Mark } from 'types/slate';
import Tooltip from 'components/Tooltip';
import { isMobile } from 'utils/device';
import EditorPopover from './EditorPopover';
import type { AddLinkPopoverState } from './Editor';

type Props = {
  setAddLinkPopoverState: (state: AddLinkPopoverState) => void;
};
export default function HoveringToolbar(props: Props) {
  const { setAddLinkPopoverState } = props;
  return (
    <EditorPopover placement={isMobile() ? 'bottom-start' : 'top-start'}>
      <LinkButton
        setAddLinkPopoverState={setAddLinkPopoverState}
        className="border-r dark:border-gray-700"
      />
      <FormatButton
        format={Mark.Bold}
        Icon={IconBold}
        tooltip="Bold (Ctrl+B)"
      />
      <FormatButton
        format={Mark.Italic}
        Icon={IconItalic}
        tooltip="Italic (Ctrl+I)"
      />
      <FormatButton
        format={Mark.Underline}
        Icon={IconUnderline}
        tooltip="Underline (Ctrl+U)"
      />
      <FormatButton
        format={Mark.Strikethrough}
        Icon={IconStrikethrough}
        tooltip="Strikethrough (Ctrl+Shift+S)"
      />
      <FormatButton
        format={Mark.Code}
        Icon={IconCode}
        tooltip="Code (Ctrl+`)"
      />
      <FormatButton
        format={Mark.Highlight}
        Icon={IconEraser}
        tooltip="Highlight (Ctrl+Shift+H)"
      />
    </EditorPopover>
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

export const ToolbarButton = (props: ToolbarButtonProps) => {
  const {
    icon: Icon,
    onClick,
    text,
    tooltip,
    isActive = false,
    className = '',
  } = props;

  return (
    <Tooltip content={tooltip} placement="top" disabled={!tooltip}>
      <span
        className={`flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${
          isActive
            ? 'text-primary-500 dark:text-primary-400'
            : 'text-gray-800 dark:text-gray-200'
        } ${className}`}
        onPointerDown={(event) => event.preventDefault()}
        onPointerUp={(event) => {
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
    </Tooltip>
  );
};

type FormatButtonProps = {
  format: Mark;
  Icon: TablerIcon;
  tooltip?: string;
  className?: string;
};

const FormatButton = (props: FormatButtonProps) => {
  const { format, Icon, tooltip, className } = props;
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

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
      tooltip="Link to a note or web page (Ctrl+K)"
    />
  );
};
