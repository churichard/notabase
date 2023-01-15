import OpenSidebarButton from 'components/sidebar/OpenSidebarButton';
import { useStore } from 'lib/store';

export default function AppHome() {
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);

  return (
    <div className="flex w-full flex-1 items-center justify-center p-12">
      {!isSidebarOpen ? (
        <OpenSidebarButton className="absolute top-0 left-0 z-10 mx-4 my-1" />
      ) : null}
      <p className="text-center text-gray-500">
        Get started by clicking &ldquo;Find or Create Note&rdquo; in the sidebar
      </p>
    </div>
  );
}
