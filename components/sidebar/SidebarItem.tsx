import { CSSProperties, memo, ReactNode } from 'react';

type SidebarItemProps = {
  children: ReactNode;
  className?: string;
  isHighlighted?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
};

function SidebarItem(props: SidebarItemProps) {
  const { children, className = '', isHighlighted, style, onClick } = props;
  return (
    <div
      className={`w-full overflow-x-hidden overflow-ellipsis whitespace-nowrap text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${className} ${
        isHighlighted ? 'bg-gray-200 dark:bg-gray-700' : ''
      }`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default memo(SidebarItem);
