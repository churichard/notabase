import { IconWifiOff } from '@tabler/icons';
import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const setOffline = () => setIsOffline(true);
    const setOnline = () => setIsOffline(false);

    window.addEventListener('offline', setOffline);
    window.addEventListener('online', setOnline);

    return () => {
      window.removeEventListener('offline', setOffline);
      window.removeEventListener('online', setOnline);
    };
  }, []);

  return isOffline ? (
    <div className="flex w-full items-center justify-center bg-red-300 py-1 text-center font-semibold text-red-900">
      <IconWifiOff size={18} className="mr-1 flex-shrink-0 text-red-900" /> You
      are offline and your changes may not be saved.
    </div>
  ) : null;
}
