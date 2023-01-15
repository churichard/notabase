import { useStore } from 'lib/store';
import Toggle from 'components/Toggle';

export default function EditorSettings() {
  const isPageStackingOn = useStore((state) => state.isPageStackingOn);
  const setIsPageStackingOn = useStore((state) => state.setIsPageStackingOn);

  return (
    <div className="h-full w-full flex-1 overflow-y-auto p-6 dark:bg-gray-800 dark:text-gray-100">
      <div className="mb-4">
        <h1 className="text-lg font-medium">Page Stacking</h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          If page stacking is on, clicking a note link will open the note on the
          side, and shift-clicking a note link will open the note by itself. If
          page stacking is off, this behavior is reversed.
        </p>
      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-600 dark:text-gray-300">Off</span>
        <Toggle
          className="mx-2"
          isChecked={isPageStackingOn}
          setIsChecked={setIsPageStackingOn}
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">On</span>
      </div>
    </div>
  );
}
