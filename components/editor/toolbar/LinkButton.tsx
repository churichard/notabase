import { memo } from 'react';
import { useSlate } from 'slate-react';
import { IconLink } from '@tabler/icons';
import { isElementActive } from 'editor/formatting';
import { ElementType } from 'types/slate';
import type { AddLinkPopoverState } from '../Editor';
import ToolbarButton from './ToolbarButton';

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

export default memo(LinkButton);
