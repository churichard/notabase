import React, { useMemo } from 'react';
import { useCurrentNote } from 'utils/useCurrentNote';
import type { Backlink } from 'editor/useBacklinks';
import useBacklinks from 'editor/useBacklinks';
import BacklinkReferences from './BacklinkReferences';

type Props = {
  className: string;
};

export default function Backlinks(props: Props) {
  const { className } = props;
  const currentNote = useCurrentNote();
  const { linkedBacklinks, unlinkedBacklinks } = useBacklinks(currentNote.id);

  const numOfLinkedMatches = useMemo(
    () => getNumOfMatches(linkedBacklinks),
    [linkedBacklinks]
  );
  const numOfUnlinkedMatches = useMemo(
    () => getNumOfMatches(unlinkedBacklinks),
    [unlinkedBacklinks]
  );

  return (
    <div className={`bg-gray-50 rounded py-4 ${className}`}>
      <BacklinkReferences
        title={`${numOfLinkedMatches} Linked References`}
        backlinks={linkedBacklinks}
      />
      <BacklinkReferences
        title={`${numOfUnlinkedMatches} Unlinked References`}
        backlinks={unlinkedBacklinks}
        className="pt-2"
      />
    </div>
  );
}

const getNumOfMatches = (backlinks: Backlink[]) =>
  backlinks.reduce(
    (numOfMatches, backlink) => numOfMatches + backlink.matches.length,
    0
  );
