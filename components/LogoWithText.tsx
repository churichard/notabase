import Link from 'next/link';
import Logo from './Logo';

export default function LogoWithText() {
  return (
    <Link href="/">
      <a className="flex items-center">
        <Logo width={28} height={28} />
        <span className="ml-2 text-xl font-semibold">Notabase</span>
      </a>
    </Link>
  );
}
