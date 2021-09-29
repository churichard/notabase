import { useStore } from 'lib/store';
import Toggle from 'components/Toggle';

export default function Appearance() {
  const darkMode = useStore((state) => state.darkMode);
  const setDarkMode = useStore((state) => state.setDarkMode);

  return (
    <div className="flex-1 w-full h-full p-6 overflow-y-auto dark:bg-gray-800 dark:text-gray-100">
      <h1 className="mb-4 text-lg font-medium">Theme</h1>
      <div className="flex items-center">
        <span className="text-sm text-gray-600 dark:text-gray-200">Light</span>
        <Toggle
          className="mx-2"
          isChecked={darkMode}
          setIsChecked={setDarkMode}
        />
        <span className="text-sm text-gray-600 dark:text-gray-200">Dark</span>
      </div>
    </div>
  );
}
