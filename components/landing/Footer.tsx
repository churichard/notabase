import Link from 'next/link';

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
            <a className="font-medium">Notabase</a>
          </Link>
          <p className="text-gray-700">
            A personal knowledge base for networked thinking.
          </p>
          <p className="text-gray-700">Currently in alpha.</p>
        </div>
        <div className="flex flex-wrap flex-1 space-x-16 lg:justify-end">
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-medium">Product</p>
            <Link href="/changelog">
              <a className="text-gray-700">Changelog</a>
            </Link>
            <a
              href="https://trello.com/b/dpZLRkRR"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Roadmap
            </a>
          </div>
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-medium">Connect</p>
            <a
              href="https://twitter.com/notabase"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://discord.gg/BQKNRu7nv5"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            <a
              href="https://github.com/churichard/notabase"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="mailto:hello@notabase.io"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact
            </a>
          </div>
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-medium">Company</p>
            <Link href="/about">
              <a className="text-gray-700">About</a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-700">Privacy</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
