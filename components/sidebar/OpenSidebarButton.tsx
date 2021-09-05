import { IconMenu2 } from '@tabler/icons';
import Tooltip from 'components/Tooltip';
import { useStore } from 'lib/store';

type Props = {
  className?: string;
};

export default function OpenSidebarButton(props: Props) {
  const { className = '' } = props;
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);

  return (
    <Tooltip content="Open sidebar" placement="right">
      <button
        className={`p-1 rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${className}`}
        onClick={() => setIsSidebarOpen(true)}
      >
        <IconMenu2 className="text-gray-600 dark:text-gray-300" />
      </button>
    </Tooltip>
  );
}
