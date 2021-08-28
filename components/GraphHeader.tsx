import { IconMenu2 } from '@tabler/icons';
import { useStore } from 'lib/store';

export default function GraphHeader() {
  const isSidebarButtonVisible = useStore((state) => !state.isSidebarOpen);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);

  return isSidebarButtonVisible ? (
    <div className="absolute top-0 left-0 z-10 px-4 py-1">
      <button
        className="p-1 rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600"
        onClick={() => setIsSidebarOpen(true)}
      >
        <IconMenu2 className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  ) : null;
}
