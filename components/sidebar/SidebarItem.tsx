import classNames from 'classnames';
import { ForwardedRef, forwardRef, HTMLAttributes, memo } from 'react';

interface SidebarItemProps extends HTMLAttributes<HTMLDivElement> {
  isHighlighted?: boolean;
}

function SidebarItem(
  props: SidebarItemProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const { children, className = '', isHighlighted, ...otherProps } = props;
  const itemClassName = classNames(
    'w-full overflow-x-hidden overflow-ellipsis whitespace-nowrap text-gray-800 bg-gray-50 hover:bg-gray-200 active:bg-gray-300 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600',
    { 'bg-gray-200 dark:bg-gray-700': isHighlighted },
    className
  );
  return (
    <div ref={forwardedRef} className={itemClassName} {...otherProps}>
      {children}
    </div>
  );
}

export default memo(forwardRef(SidebarItem));
