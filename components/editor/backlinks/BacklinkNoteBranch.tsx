import { memo } from 'react';
import Link from 'next/link';
import { Backlink } from 'editor/backlinks/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';
import { useCurrentNote } from 'utils/useCurrentNote';

type BacklinkNoteBranchProps = {
  backlink: Backlink;
};

const BacklinkNoteBranch = (props: BacklinkNoteBranchProps) => {
  const { backlink } = props;
  const currentNote = useCurrentNote();
  const onNoteLinkClick = useOnNoteLinkClick(currentNote.id);
  const isPageStackingOn = useStore((state) => state.isPageStackingOn);

  return isPageStackingOn ? (
    <button
      className="py-1 link"
      onClick={(e) => {
        e.stopPropagation();
        onNoteLinkClick(backlink.id, e.shiftKey);
      }}
    >
      {backlink.title}
    </button>
  ) : (
    <Link href={`/app/note/${backlink.id}`}>
      <a className="py-1 link" onClick={(e) => e.stopPropagation()}>
        {backlink.title}
      </a>
    </Link>
  );
};

export default memo(BacklinkNoteBranch);
