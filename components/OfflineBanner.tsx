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
    <div className="flex items-center justify-center w-full py-1 font-semibold text-center text-red-900 bg-red-300">
      <IconWifiOff size={18} className="flex-shrink-0 mr-1 text-red-900" /> You
      are offline and your changes may not be saved.
    </div>
  ) : null;
}
