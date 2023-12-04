import classNames from 'classnames';
import { useRouter } from 'next/router';
import Logo from 'components/Logo';
import Tooltip from 'components/Tooltip';

export default function PublishFooter() {
  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';

  const router = useRouter();
  const {
    query: { siteId, noteId },
  } = router;
  const poweredByUrl = `https://notabase.io/?utm_source=note-id-${noteId}&utm_medium=site-id-${siteId}&utm_campaign=notabase-publish-link&utm_content=powered-by-notabase`;

  return (
    <div className="flex w-full items-center justify-center border-t px-4 py-1 text-right">
      <Tooltip content="Learn more about Notabase">
        <a
          className={classNames(buttonClassName, 'p-1')}
          href={poweredByUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center">
            <Logo width={20} height={20} />
            <span className="ml-1.5 text-sm">Powered by Notabase</span>
          </div>
        </a>
      </Tooltip>
    </div>
  );
}
