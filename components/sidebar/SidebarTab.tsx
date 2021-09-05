import { ForwardedRef, forwardRef } from 'react';
import { TablerIcon } from '@tabler/icons';

type Props = {
  isActive: boolean;
  setActive: () => void;
  Icon: TablerIcon;
  className?: string;
};

const SidebarTab = (
  props: Props,
  forwardedRef: ForwardedRef<HTMLButtonElement>
) => {
  const { isActive, setActive, Icon, className = '' } = props;
  return (
    <button
      ref={forwardedRef}
      className={`flex justify-center flex-1 py-1.5 px-6 rounded-t hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:border-gray-700 ${
        isActive ? 'bg-gray-50 border-t dark:bg-gray-800' : 'border-b'
      } ${className}`}
      onClick={setActive}
    >
      <Icon
        size={20}
        className={
          isActive ? 'text-gray-800 dark:text-gray-300' : 'text-gray-500'
        }
      />
    </button>
  );
};

export default forwardRef(SidebarTab);
