import { memo, useMemo } from 'react';
import { ReactEditor, useSlate, useSlateSelection } from 'slate-react';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconHighlight,
} from '@tabler/icons';
import { Editor, Range } from 'slate';
import { Mark } from 'types/slate';
import { isMobile } from 'utils/device';
import EditorPopover from '../EditorPopover';
import type { AddLinkPopoverState } from '../Editor';
import FormatButton from './FormatButton';
import LinkButton from './LinkButton';

type Props = {
  canBeVisible: boolean;
  setAddLinkPopoverState: (state: AddLinkPopoverState) => void;
};

function HoveringToolbar(props: Props) {
  const { canBeVisible, setAddLinkPopoverState } = props;

  const editor = useSlate();
  const selection = useSlateSelection();

  const hasExpandedSelection = useMemo(
    () =>
      !!selection &&
      ReactEditor.isFocused(editor) &&
      !Range.isCollapsed(selection) &&
      Editor.string(editor, selection, { voids: true }) !== '',
    [editor, selection]
  );
  const isToolbarVisible = useMemo(
    () => canBeVisible && hasExpandedSelection,
    [canBeVisible, hasExpandedSelection]
  );

  if (!isToolbarVisible) {
    return null;
  }

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
        aria-label="Bold"
      />
      <FormatButton
        format={Mark.Italic}
        Icon={IconItalic}
        tooltip="Italic (Ctrl+I)"
        aria-label="Italic"
      />
      <FormatButton
        format={Mark.Underline}
        Icon={IconUnderline}
        tooltip="Underline (Ctrl+U)"
        aria-label="Underline"
      />
      <FormatButton
        format={Mark.Strikethrough}
        Icon={IconStrikethrough}
        tooltip="Strikethrough (Ctrl+Shift+S)"
        aria-label="Strikethrough"
      />
      <FormatButton
        format={Mark.Code}
        Icon={IconCode}
        tooltip="Code (Ctrl+`)"
        aria-label="Code"
      />
      <FormatButton
        format={Mark.Highlight}
        Icon={IconHighlight}
        tooltip="Highlight (Ctrl+Shift+H)"
        aria-label="Highlight"
      />
    </EditorPopover>
  );
}

export default memo(HoveringToolbar);
