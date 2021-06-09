import React, { memo, useMemo } from 'react';
import { Backlink, BacklinkMatch } from 'editor/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import BacklinkMatchBlock from './BacklinkMatchBlock';

type BacklinkNoteBlockProps = {
  backlink: Backlink;
};

const BacklinkNoteBlock = (props: BacklinkNoteBlockProps) => {
  const { backlink } = props;
  const onNoteLinkClick = useOnNoteLinkClick();

  const matches = useMemo(() => {
    const matches: Array<BacklinkMatch> = [];
    const paths: Record<string, boolean> = {};

    for (const match of backlink.matches) {
      const pathKey = match.linePath.toString();
      if (!paths[pathKey]) {
        matches.push(match);
        paths[pathKey] = true;
      }
    }

    return matches;
  }, [backlink]);

  return (
    <button
      key={backlink.id}
      className="block w-full p-2 text-left rounded hover:bg-gray-200 active:bg-gray-300"
      onClick={() => onNoteLinkClick(backlink.id)}
    >
      <span className="block text-sm text-gray-800">{backlink.title}</span>
      {matches.map((match, index) => (
        <BacklinkMatchBlock key={index} match={match} />
      ))}
    </button>
  );
};

export default memo(BacklinkNoteBlock);
