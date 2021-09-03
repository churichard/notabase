import Head from 'next/head';
import LandingLayout from 'components/landing/LandingLayout';

export default function Changelog() {
  return (
    <LandingLayout>
      <Head>
        <title>Changelog | Notabase</title>
      </Head>
      <div className="container px-6 pt-12 pb-16 prose lg:prose-xl prose-primary">
        <h1>Changelog</h1>
        <p>
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
          title="September 3, 2021"
          features={[
            'Move block formatting options to block menu',
            'Add image button to block menu',
          ]}
        />
        <ChangelogBlock
          title="September 2, 2021"
          bugFixes={['Improve performance when calculating block backlinks']}
        />
        <ChangelogBlock
          title="September 1, 2021"
          features={[
            'Block references are here 🔥. Now you can embed blocks of text from other notes. These block references auto-update when the original block changes.',
          ]}
        />
        <ChangelogBlock
          title="August 30, 2021"
          features={[
            'You can now sort notes by date modified or created',
            'The date modified or created for each note is now visible in the dropdown',
          ]}
          bugFixes={['Improve list normalization']}
        />
        <ChangelogBlock
          title="August 29, 2021"
          features={['Add dark mode 🌙']}
        />
        <ChangelogBlock
          title="August 27, 2021"
          features={[
            'Improve sidebar performance',
            'Improve import performance and stability',
          ]}
        />
        <ChangelogBlock
          title="August 26, 2021"
          bugFixes={[
            "Fix bug where importing doesn't work properly with note links",
            'Improve nested list support when importing',
            'Improve image support when importing',
          ]}
        />
        <ChangelogBlock
          title="August 9, 2021"
          features={['Notabase is now in beta! 🎉']}
          bugFixes={[
            'Fix graph view radius computation',
            'Importing and exporting improvements',
            "Fix bug where paywall shows up when it's not supposed to",
          ]}
        />
        <ChangelogBlock
          title="August 5, 2021"
          features={[
            'Add support for image uploads (by copying + pasting or dragging + dropping)',
          ]}
        />
        <ChangelogBlock
          title="July 29, 2021"
          features={['Add support for wiki links when importing a note']}
          bugFixes={[
            "Don't create paragraphs in a nested list when pressing enter or backspace",
            "Don't convert markdown shortcuts in code blocks",
            'Remove enclosing list when typing a block markdown shortcut in a list',
          ]}
        />
        <ChangelogBlock
          title="July 27, 2021"
          features={[
            'Add persistence of user settings',
            'Default to opening most recent note',
          ]}
        />
        <ChangelogBlock title="July 26, 2021" features={['Add help center']} />
        <ChangelogBlock
          title="July 22, 2021"
          bugFixes={[
            'The graph view is no longer blurry on high resolution devices',
          ]}
        />
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
    </LandingLayout>
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
    <div className="py-1">
      <h2>{title}</h2>
      {features && features.length > 0 ? (
        <>
          <p>
            <b>Features</b>
          </p>
          <ul>
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </>
      ) : null}
      {bugFixes && bugFixes.length > 0 ? (
        <>
          <p>
            <b>Bug Fixes</b>
          </p>
          <ul>
            {bugFixes.map((bugFix, index) => (
              <li key={index}>{bugFix}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
};
