import { memo } from 'react';
import Link from 'next/link';
import { Backlink } from 'editor/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';

type BacklinkNoteBranchProps = {
  backlink: Backlink;
};

const BacklinkNoteBranch = (props: BacklinkNoteBranchProps) => {
  const { backlink } = props;
  const onNoteLinkClick = useOnNoteLinkClick();
  const isPageStackingOn = useStore((state) => state.isPageStackingOn);

  return isPageStackingOn ? (
    <button
      className="link"
      onClick={(e) => {
        e.stopPropagation();
        onNoteLinkClick(backlink.id);
      }}
    >
      {backlink.title}
    </button>
  ) : (
    <Link href={`/app/note/${backlink.id}`}>
      <a className="link" onClick={(e) => e.stopPropagation()}>
        {backlink.title}
      </a>
    </Link>
  );
};

export default memo(BacklinkNoteBranch);
