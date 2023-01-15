import { useMemo } from 'react';
import { useCurrentNote } from 'utils/useCurrentNote';
import type { Backlink, BacklinkMatch } from 'editor/backlinks/useBacklinks';
import useBacklinks from 'editor/backlinks/useBacklinks';
import Tree from 'components/Tree';
import BacklinkReferenceBranch from './BacklinkReferenceBranch';
import BacklinkMatchLeaf from './BacklinkMatchLeaf';
import BacklinkNoteBranch from './BacklinkNoteBranch';

const MAX_EXPANDED_MATCHES = 50;

type Props = {
  className?: string;
};

export default function Backlinks(props: Props) {
  const { className } = props;
  const currentNote = useCurrentNote();
  const { linkedBacklinks, unlinkedBacklinks } = useBacklinks(currentNote.id);

  const backlinkData = useMemo(
    () => getTreeData(linkedBacklinks, unlinkedBacklinks),
    [linkedBacklinks, unlinkedBacklinks]
  );

  const collapseAll = useMemo(() => {
    const numOfLinkedMatches = getNumOfMatches(linkedBacklinks);
    const numOfUnlinkedMatches = getNumOfMatches(unlinkedBacklinks);
    return (
      numOfLinkedMatches > MAX_EXPANDED_MATCHES ||
      numOfUnlinkedMatches > MAX_EXPANDED_MATCHES
    );
  }, [linkedBacklinks, unlinkedBacklinks]);

  return (
    <Tree data={backlinkData} className={className} collapseAll={collapseAll} />
  );
}

export const getNumOfMatches = (backlinks: Backlink[]) =>
  backlinks.reduce(
    (numOfMatches, backlink) => numOfMatches + backlink.matches.length,
    0
  );

const getTreeData = (
  linkedBacklinks: Backlink[],
  unlinkedBacklinks: Backlink[]
) => {
  const numOfLinkedMatches = getNumOfMatches(linkedBacklinks);
  const numOfUnlinkedMatches = getNumOfMatches(unlinkedBacklinks);

  return [
    {
      id: 'linked-backlinks',
      labelNode: (
        <BacklinkReferenceBranch
          title={`${numOfLinkedMatches} Linked References`}
        />
      ),
      children: linkedBacklinks.map(backlinkToTreeData),
    },
    {
      id: 'unlinked-backlinks',
      labelNode: (
        <BacklinkReferenceBranch
          title={`${numOfUnlinkedMatches} Unlinked References`}
        />
      ),
      children: unlinkedBacklinks.map(backlinkToTreeData),
    },
  ];
};

const backlinkToTreeData = (backlink: Backlink) => {
  const matches: Array<BacklinkMatch> = [];
  const linePaths: Record<string, boolean> = {};

  // Only keep matches with unique line paths
  for (const match of backlink.matches) {
    const linePathKey = match.linePath.toString();
    if (!linePaths[linePathKey]) {
      matches.push(match);
      linePaths[linePathKey] = true;
    }
  }

  return {
    id: `${backlink.type}-${backlink.id}`,
    labelNode: <BacklinkNoteBranch backlink={backlink} />,
    children: matches.map((match) => ({
      id: `${backlink.type}-${backlink.id}-${match.path.toString()}`,
      labelNode: (
        <BacklinkMatchLeaf
          noteId={backlink.id}
          match={match}
          className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      ),
      showArrow: false,
    })),
  };
};
