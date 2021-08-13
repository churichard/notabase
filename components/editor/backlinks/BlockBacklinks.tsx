import { useMemo } from 'react';
import type { Backlink, BacklinkMatch } from 'editor/useBacklinks';
import Tree from 'components/Tree';
import BacklinkReferenceBranch from './BacklinkReferenceBranch';
import BacklinkMatchLeaf from './BacklinkMatchLeaf';
import BacklinkNoteBranch from './BacklinkNoteBranch';
import { getNumOfMatches } from './Backlinks';

type Props = {
  backlinks: Backlink[];
  className?: string;
};

export default function BlockBacklinks(props: Props) {
  const { backlinks, className } = props;
  const backlinkData = useMemo(() => getTreeData(backlinks), [backlinks]);
  return (
    <div className={className}>
      <Tree data={backlinkData} />
    </div>
  );
}

const getTreeData = (backlinks: Backlink[]) => {
  const numOfMatches = getNumOfMatches(backlinks);
  return [
    {
      id: 'block-backlinks',
      labelNode: (
        <BacklinkReferenceBranch title={`${numOfMatches} Block References`} />
      ),
      children: backlinks.map(backlinkToTreeData),
    },
  ];
};

const backlinkToTreeData = (backlink: Backlink) => {
  const matches: Array<BacklinkMatch> = backlink.matches;
  return {
    id: `block-${backlink.id}`,
    labelNode: <BacklinkNoteBranch backlink={backlink} />,
    children: matches.map((match) => ({
      id: `block-${backlink.id}-${match.path.toString()}`,
      labelNode: <BacklinkMatchLeaf noteId={backlink.id} match={match} />,
      showArrow: false,
    })),
  };
};
