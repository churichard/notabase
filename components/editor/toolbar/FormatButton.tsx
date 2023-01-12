import { HTMLAttributes, memo } from 'react';
import { useSlate } from 'slate-react';
import { TablerIcon } from '@tabler/icons';
import { toggleMark, isMarkActive } from 'editor/formatting';
import { Mark } from 'types/slate';
import ToolbarButton from './ToolbarButton';

interface FormatButtonProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  format: Mark;
  Icon: TablerIcon;
  tooltip?: string;
  className?: string;
}

const FormatButton = (props: FormatButtonProps) => {
  const { format, Icon, tooltip, className, ...otherProps } = props;
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <ToolbarButton
      icon={Icon}
      onClick={() => toggleMark(editor, format)}
      isActive={isActive}
      className={className}
      tooltip={tooltip}
      {...otherProps}
    />
  );
};

export default memo(FormatButton);
