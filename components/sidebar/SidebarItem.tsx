import { CSSProperties, ReactNode } from 'react';

type SidebarItemProps = {
  children: ReactNode;
  className?: string;
  isHighlighted?: boolean;
  style?: CSSProperties;
};

export default function SidebarItem(props: SidebarItemProps) {
  const { children, className = '', isHighlighted, style } = props;
  return (
    <div
      className={`w-full text-gray-800 hover:bg-gray-200 active:bg-gray-300 ${className} ${
        isHighlighted ? 'bg-gray-200' : ''
      }`}
      style={style}
    >
      {children}
    </div>
  );
}
