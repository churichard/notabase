import Spinner from './Spinner';
import Logo from './Logo';

export default function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen space-y-4">
      <Logo width={128} height={128} />
      <Spinner />
    </div>
  );
}
