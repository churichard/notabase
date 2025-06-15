import Head from 'next/head';
import LandingLayout from 'components/landing/LandingLayout';

export default function Sponsors() {
  return (
    <LandingLayout>
      <Head>
        <title>Sponsors | Notabase</title>
      </Head>
      <div className="prose-primary container prose px-6 py-16 lg:prose-xl">
        <h1>Sponsors</h1>
        <div>
          <p>
            Special thanks to the following people/companies for their support:
          </p>
          <ul>
            <li>
              <a
                href="https://github.com/Jaydon-chai"
                target="_blank"
                rel="noopener noreferrer"
              >
                @Jaydon-chai
              </a>
            </li>
            <li>
              <a
                href="https://explorejobs.ai?ref=notabase.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                ExploreJobs.ai
              </a>
            </li>
          </ul>
          <p>
            If you&apos;d like to sponsor Notabase,{' '}
            <a
              href="https://github.com/sponsors/churichard"
              target="_blank"
              rel="noopener noreferrer"
            >
              click here
            </a>
            . Your support is greatly appreciated!
          </p>
        </div>
      </div>
    </LandingLayout>
  );
}
