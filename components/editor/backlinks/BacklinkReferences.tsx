import React, { memo } from 'react';
import { Backlink } from 'editor/useBacklinks';
import BacklinkNoteBlock from './BacklinkNoteBlock';

type BacklinkReferencesProps = {
  title: string;
  backlinks: Backlink[];
  className?: string;
};

const BacklinkReferences = (props: BacklinkReferencesProps) => {
  const { title, backlinks, className } = props;

  return (
    <div className={className}>
      <p className="px-4 text-lg text-gray-800">{title}</p>
      {backlinks.length > 0 ? (
        <div className="mx-2 mt-2">
          {backlinks.map((backlink) => (
            <BacklinkNoteBlock key={backlink.id} backlink={backlink} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default memo(BacklinkReferences);
