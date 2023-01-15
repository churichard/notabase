import { useStore } from 'lib/store';
import Toggle from 'components/Toggle';

export default function Appearance() {
  const darkMode = useStore((state) => state.darkMode);
  const setDarkMode = useStore((state) => state.setDarkMode);

  return (
    <div className="h-full w-full flex-1 overflow-y-auto p-6 dark:bg-gray-800 dark:text-gray-100">
      <h1 className="mb-4 text-lg font-medium">Theme</h1>
      <div className="flex items-center">
        <span className="text-sm text-gray-600 dark:text-gray-300">Light</span>
        <Toggle
          className="mx-2"
          isChecked={darkMode}
          setIsChecked={setDarkMode}
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">Dark</span>
      </div>
    </div>
  );
}
