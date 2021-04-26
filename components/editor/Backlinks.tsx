import React from 'react';
import { useCurrentNote } from 'utils/useCurrentNote';
import useBacklinks from 'editor/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';

type Props = {
  className: string;
};

export default function Backlinks(props: Props) {
  const { className } = props;
  const currentNote = useCurrentNote();
  const { backlinks } = useBacklinks(currentNote.id);
  const onNoteLinkClick = useOnNoteLinkClick();

  return (
    <div className={`bg-gray-50 rounded py-4 ${className}`}>
      <p className="px-4 text-xl text-gray-800">
        {backlinks.length} Linked References
      </p>
      {backlinks.length > 0 ? (
        <div className="mx-2 mt-2">
          {backlinks.map((backlink) => (
            <button
              key={backlink.id}
              className="block w-full p-2 text-left rounded hover:bg-gray-200 active:bg-gray-300"
              onClick={() => onNoteLinkClick(backlink.id)}
            >
              <span className="block text-sm text-gray-800">
                {backlink.title}
              </span>
              {backlink.matches.map((match, index) => {
                return (
                  <span
                    key={index}
                    className="block my-1 text-xs text-gray-600"
                  >
                    {match.context}
                  </span>
                );
              })}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
