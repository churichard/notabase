import Link from 'next/link';
import Image from 'next/image';
import logo from 'public/logo.svg';

type Props = {
  className?: string;
};

export default function Footer(props: Props) {
  const { className } = props;
  return (
    <div className={`py-8 bg-gray-50 md:py-16 ${className}`}>
      <div className="container flex flex-col justify-between px-6 lg:flex-row">
        <div>
          <Link href="/">
            <a className="flex items-center">
              <Image src={logo} width={28} height={28} alt="Notabase logo" />
              <span className="ml-2 text-xl font-semibold">Notabase</span>
            </a>
          </Link>
          <p className="pt-2 text-gray-700">
            A personal knowledge base for networked thinking.
          </p>
        </div>
        <div className="flex flex-wrap flex-1 space-x-16 lg:justify-end">
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-semibold">Product</p>
            <Link href="/changelog">
              <a className="text-gray-700 hover:text-primary-500">Changelog</a>
            </Link>
            <a
              href="https://trello.com/b/dpZLRkRR"
              className="text-gray-700 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Roadmap
            </a>
          </div>
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-semibold">Connect</p>
            <a
              href="https://twitter.com/notabase"
              className="text-gray-700 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://discord.gg/BQKNRu7nv5"
              className="text-gray-700 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            <a
              href="https://github.com/churichard/notabase"
              className="text-gray-700 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="mailto:hello@notabase.io"
              className="text-gray-700 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact
            </a>
          </div>
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-semibold">Company</p>
            <Link href="/about">
              <a className="text-gray-700 hover:text-primary-500">About</a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-700 hover:text-primary-500">Privacy</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
