import Link from 'next/link';
import Logo from 'public/logo';

export default function LogoWithText() {
  return (
    <Link href="/" className="flex items-center">
      <Logo width={28} height={28} />
      <span className="ml-2 text-xl font-medium">vs. notes</span>
    </Link>
  );
}
