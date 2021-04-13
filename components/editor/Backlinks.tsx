import React from 'react';
import Link from 'next/link';
import { useCurrentNote } from 'utils/useCurrentNote';
import useBacklinks from 'editor/useBacklinks';

type Props = {
  className: string;
};

export default function Backlinks(props: Props) {
  const { className } = props;
  const currentNote = useCurrentNote();
  const backlinks = useBacklinks(currentNote.id);

  return (
    <div className={`bg-gray-50 rounded py-4 ${className}`}>
      <p className="px-4 text-xl text-gray-800">
        {backlinks.length} Linked References
      </p>
      {backlinks.length > 0 ? (
        <div className="mx-2 mt-2">
          {backlinks.map((backlink) => (
            <Link key={backlink.id} href={`/app/note/${backlink.id}`}>
              <a className="block p-2 rounded hover:bg-gray-200 active:bg-gray-300">
                <span className="block text-sm text-gray-800">
                  {backlink.title}
                </span>
                {backlink.matches.map((match, index) => {
                  return (
                    <span
                      key={index}
                      className="block my-1 text-xs text-gray-600"
                    >
                      {match}
                    </span>
                  );
                })}
              </a>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
