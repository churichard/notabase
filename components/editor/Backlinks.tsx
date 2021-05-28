import React from 'react';
import { useCurrentNote } from 'utils/useCurrentNote';
import type { Backlink } from 'editor/useBacklinks';
import useBacklinks from 'editor/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';

type Props = {
  className: string;
};

export default function Backlinks(props: Props) {
  const { className } = props;
  const currentNote = useCurrentNote();
  const { linkedBacklinks, unlinkedBacklinks } = useBacklinks(currentNote.id);

  return (
    <div className={`bg-gray-50 rounded py-4 ${className}`}>
      <BacklinkBlock
        title={`${linkedBacklinks.length} Linked References`}
        backlinks={linkedBacklinks}
      />
      <BacklinkBlock
        title={`${unlinkedBacklinks.length} Unlinked References`}
        backlinks={unlinkedBacklinks}
        className="pt-2"
      />
    </div>
  );
}

type BacklinkBlockProps = {
  title: string;
  backlinks: Backlink[];
  className?: string;
};

const BacklinkBlock = (props: BacklinkBlockProps) => {
  const { title, backlinks, className } = props;
  const onNoteLinkClick = useOnNoteLinkClick();
  return (
    <div className={className}>
      <p className="px-4 text-lg text-gray-800">{title}</p>
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
                    className="block my-1 text-xs text-gray-600 break-words"
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
};
