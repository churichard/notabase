import Link from 'next/link';
import LogoWithText from 'components/LogoWithText';

type Props = {
  className?: string;
};

export default function Footer(props: Props) {
  const { className } = props;
  return (
    <div className={`py-8 md:py-16 ${className}`}>
      <div className="container flex flex-col justify-between px-6 lg:flex-row">
        <div>
          <div className="inline-block">
            <LogoWithText />
          </div>
          <p className="pt-0.5 text-gray-700 max-w-sm">
            Powerful and easy-to-use note-taking app for networked thinking.
          </p>
          <div className="mt-4">
            <a
              href="https://www.producthunt.com/posts/notabase?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-notabase"
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=314758&theme=light"
                alt="Notabase - Easy-to-use note-taking app for networked thinking | Product Hunt"
                style={{ width: 250, height: 54 }}
                width="250"
                height="54"
              />
            </a>
          </div>
        </div>
        <div className="flex flex-wrap flex-1 space-x-16 lg:justify-end">
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-medium">Product</p>
            <Link href="/pricing">
              <a className="text-gray-700 hover:text-primary-500">Pricing</a>
            </Link>
            <a
              href="https://help.notabase.io"
              className="text-gray-700 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Help Center
            </a>
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
            <p className="font-medium">Connect</p>
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
            <p className="font-medium">Company</p>
            <Link href="/about">
              <a className="text-gray-700 hover:text-primary-500">About</a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-700 hover:text-primary-500">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-700 hover:text-primary-500">Terms</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
