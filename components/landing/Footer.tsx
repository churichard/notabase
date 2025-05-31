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
          <p className="max-w-sm pt-0.5 text-gray-700">
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
        <div className="flex flex-1 flex-wrap space-x-16 lg:justify-end">
          <div className="mt-8 flex flex-col space-y-2 lg:mt-0">
            <p className="font-medium">Product</p>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-primary-500"
            >
              Pricing
            </Link>
            <a
              href="https://notabase.io/publish/ed280468-4096-4b21-8298-4a97c4eb990e/note/59df6332-0356-4c06-83ba-a90682ab18fc/"
              className="text-gray-700 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Help Center
            </a>
          </div>
          <div className="mt-8 flex flex-col space-y-2 lg:mt-0">
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
          <div className="mt-8 flex flex-col space-y-2 lg:mt-0">
            <p className="font-medium">Company</p>
            <Link
              href="/about"
              className="text-gray-700 hover:text-primary-500"
            >
              About
            </Link>
            <Link
              href="/sponsors"
              className="text-gray-700 hover:text-primary-500"
            >
              Sponsors
            </Link>
            <Link
              href="/privacy"
              className="text-gray-700 hover:text-primary-500"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-700 hover:text-primary-500"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
