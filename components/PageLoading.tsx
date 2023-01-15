import Spinner from './Spinner';
import Logo from './Logo';

export default function PageLoading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-4 dark:bg-gray-900">
      <Logo width={128} height={128} />
      <Spinner />
    </div>
  );
}
