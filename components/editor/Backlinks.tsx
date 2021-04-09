import React from 'react';
import Link from 'next/link';
import useBacklinks from 'lib/api/useBacklinks';
import { useCurrentNote } from 'utils/useCurrentNote';

type Props = {
  className: string;
};

export default function Backlinks(props: Props) {
  const { className } = props;
  const currentNote = useCurrentNote();
  const { data: backlinks = [] } = useBacklinks(currentNote.id);

  return (
    <div className={`bg-gray-50 rounded py-4 ${className}`}>
      <p className="px-4 text-xl text-gray-800">
        {backlinks.length} Linked References
      </p>
      {backlinks.length > 0 ? (
        <div className="grid grid-cols-2 gap-1 mx-2 mt-2">
          {backlinks.map((backlink) => (
            <Link key={backlink.id} href={`/app/note/${backlink.tail.id}`}>
              <a className="flex-1 p-2 rounded hover:bg-gray-200 active:bg-gray-300">
                <p className="text-gray-800">{backlink.tail.title}</p>
                {/* {textMatches(backlink.tail.content).map((text, index) => {
                return <p key={index}>{text}</p>;
              })} */}
              </a>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
