import { ReactNode } from 'react';

type SidebarItemProps = {
  children: ReactNode;
  className?: string;
  isHighlighted?: boolean;
};

export default function SidebarItem(props: SidebarItemProps) {
  const { children, className, isHighlighted } = props;
  return (
    <div
      className={`w-full text-gray-800 hover:bg-gray-200 active:bg-gray-300 ${className} ${
        isHighlighted ? 'bg-gray-200' : 'bg-gray-50'
      }`}
    >
      {children}
    </div>
  );
}
