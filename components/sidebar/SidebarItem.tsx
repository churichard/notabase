import { ForwardedRef, forwardRef, HTMLAttributes, memo } from 'react';

interface SidebarItemProps extends HTMLAttributes<HTMLDivElement> {
  isHighlighted?: boolean;
}

function SidebarItem(
  props: SidebarItemProps,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const { children, className = '', isHighlighted, ...otherProps } = props;
  return (
    <div
      ref={forwardedRef}
      className={`w-full overflow-x-hidden overflow-ellipsis whitespace-nowrap text-gray-800 bg-gray-50 hover:bg-gray-200 active:bg-gray-300 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${className} ${
        isHighlighted ? 'bg-gray-200 dark:bg-gray-700' : ''
      }`}
      {...otherProps}
    >
      {children}
    </div>
  );
}

export default memo(forwardRef(SidebarItem));
