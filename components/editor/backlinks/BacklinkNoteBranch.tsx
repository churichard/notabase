import { memo } from 'react';
import { Backlink } from 'editor/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';

type BacklinkNoteBranchProps = {
  backlink: Backlink;
};

const BacklinkNoteBranch = (props: BacklinkNoteBranchProps) => {
  const { backlink } = props;
  const onNoteLinkClick = useOnNoteLinkClick();

  return (
    <button
      className="link"
      onClick={(e) => {
        e.stopPropagation();
        onNoteLinkClick(backlink.id);
      }}
    >
      {backlink.title}
    </button>
  );
};

export default memo(BacklinkNoteBranch);
