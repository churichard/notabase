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
        <h1 className="text-4xl font-semibold text-center md:text-5xl">
          Changelog
        </h1>
        <p className="pt-8">
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
        <div className="divide-y">
          <ChangelogBlock
            title="July 20, 2021"
            bugFixes={[
              'Fix an issue where open notes may not be scrolled into view properly',
            ]}
          />
          <ChangelogBlock
            title="July 16, 2021"
            bugFixes={['Make authentication more robust']}
          />
          <ChangelogBlock
            title="July 15, 2021"
            features={[
              'Add support for images (hosted externally)',
              'Note panes can now be closed',
            ]}
          />
          <ChangelogBlock
            title="July 13, 2021"
            features={['Add the ability to import notes']}
            bugFixes={['Fix exporting underlined text']}
          />
          <ChangelogBlock
            title="July 8, 2021"
            features={[
              'Add the option to sort notes by ascending or descending order',
            ]}
          />
          <ChangelogBlock
            title="July 7, 2021"
            features={[
              'Horizontally center notes for a more ergonomic experience',
            ]}
          />
          <ChangelogBlock
            title="July 5, 2021"
            bugFixes={[
              'Show hovering toolbar when highlighting note link',
              'Fix bug where pressing enter in a bullet point with only a note link inside deletes the bullet point',
            ]}
          />
          <ChangelogBlock
            title="July 2, 2021"
            features={['Add thematic break / horizontal rule']}
          />
          <ChangelogBlock
            title="July 1, 2021"
            features={[
              'Add searching of note content',
              'Highlight and scroll to backlink match when clicked',
            ]}
          />
          <ChangelogBlock
            title="June 30, 2021"
            bugFixes={['Performance improvements']}
          />
          <ChangelogBlock
            title="June 24, 2021"
            features={[
              'Add code block',
              'Update the way note links are displayed',
            ]}
          />
          <ChangelogBlock
            title="June 21, 2021"
            features={['Add strikethrough']}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

type ChangelogBlockProps = {
  title: string;
  features?: string[];
  bugFixes?: string[];
};

const ChangelogBlock = (props: ChangelogBlockProps) => {
  const { title, features, bugFixes } = props;
  return (
    <div className="py-8">
      <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
      {features && features.length > 0 ? (
        <>
          <p className="pt-4 font-semibold">Features</p>
          <ul className="mt-2 ml-5 space-y-1 list-disc">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </>
      ) : null}
      {bugFixes && bugFixes.length > 0 ? (
        <>
          <p className="pt-4 font-semibold">Bug Fixes</p>
          <ul className="mt-2 ml-5 space-y-1 list-disc">
            {bugFixes.map((bugFix, index) => (
              <li key={index}>{bugFix}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
};
