import { HTMLAttributes, memo } from 'react';
import { TablerIcon } from '@tabler/icons';
import classNames from 'classnames';
import Tooltip from 'components/Tooltip';

interface ToolbarButtonProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  icon: TablerIcon;
  onClick: () => void;
  text?: string;
  tooltip?: string;
  isActive?: boolean;
  className?: string;
}

const ToolbarButton = (props: ToolbarButtonProps) => {
  const {
    icon: Icon,
    onClick,
    text,
    tooltip,
    isActive = false,
    className,
    ...otherProps
  } = props;

  const buttonClassName = classNames(
    'flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600',
    { 'text-primary-500 dark:text-primary-400': isActive },
    { 'text-gray-800 dark:text-gray-200': !isActive },
    className
  );

  return (
    <Tooltip content={tooltip} placement="top" disabled={!tooltip}>
      <span
        role="button"
        className={buttonClassName}
        onPointerDown={(event) => event.preventDefault()}
        onPointerUp={(event) => {
          if (event.button === 0) {
            event.preventDefault();
            onClick();
          }
        }}
        {...otherProps}
      >
        <Icon size={18} />
        {text ? (
          <span className="ml-1 text-sm tracking-wide">{text}</span>
        ) : null}
      </span>
    </Tooltip>
  );
};

export default memo(ToolbarButton);
