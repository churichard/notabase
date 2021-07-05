import Head from 'next/head';
import Footer from 'components/landing/Footer';
import Navbar from 'components/landing/Navbar';

export default function Changelog() {
  return (
    <>
      <Head>
        <title>Changelog | Notabase</title>
      </Head>
      <Navbar />
      <div className="container px-6 pt-12 pb-16 max-w-prose">
        <h1 className="text-4xl font-medium text-center md:text-5xl">
          Changelog
        </h1>
        <p className="pt-6">
          This page lists when major features and bug fixes are added to
          Notabase. Note that Notabase is constantly being updated and this page
          may not be comprehensive. For a full list of technical changes, go to{' '}
          <a
            className="link"
            href="https://github.com/churichard/notabase/commits/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            Notabase&apos;s public GitHub
          </a>
          .
        </p>
        <ChangelogBlock
          title="July 2, 2021"
          changes={['Add thematic break / horizontal rule']}
        />
        <ChangelogBlock
          title="July 1, 2021"
          changes={[
            'Add searching of note content',
            'Highlight and scroll to backlink match when clicked',
          ]}
        />
        <ChangelogBlock
          title="June 30, 2021"
          changes={['Performance improvements']}
        />
        <ChangelogBlock
          title="June 24, 2021"
          changes={[
            'Add code block',
            'Update the way note links are displayed',
          ]}
        />
        <ChangelogBlock title="June 21, 2021" changes={['Add strikethrough']} />
      </div>
      <Footer />
    </>
  );
}

type ChangelogBlockProps = {
  title: string;
  changes: string[];
};

const ChangelogBlock = (props: ChangelogBlockProps) => {
  const { title, changes } = props;
  return (
    <div className="pt-8 md:pt-16">
      <h2 className="text-2xl font-medium md:text-3xl">{title}</h2>
      <ul className="mt-4 space-y-1 list-disc list-inside">
        {changes.map((change, index) => (
          <li key={index}>{change}</li>
        ))}
      </ul>
    </div>
  );
};
