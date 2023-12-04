import Link from 'next/link';
import STRINGS from 'constants/strings';
import Logo from './Logo';

type Props = {
  className?: string;
};

export default function NotePermissionError(props: Props) {
  const { className } = props;

  return (
    <div className={className}>
      <Logo width={64} height={64} />
      <p className="mt-6 text-center text-2xl">
        {STRINGS.error.notePermissionError}
      </p>
      <Link href="/app" className="btn mt-6">
        Go back to my notes
      </Link>
    </div>
  );
}
