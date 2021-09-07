import { useState, useMemo, useCallback, memo, useRef } from 'react';
import { useVirtual } from 'react-virtual';
import { useRouter } from 'next/router';
import { NoteTreeItem } from 'lib/store';
import SidebarNoteLink from './SidebarNoteLink';

export type FlattenedNoteTreeItem = {
  id: string;
  depth: number;
  collapsed: boolean;
};

type Props = {
  data: NoteTreeItem[];
  className?: string;
  collapseAll?: boolean;
};

function SidebarNotesTree(props: Props) {
  const { data, className, collapseAll = false } = props;

  const router = useRouter();
  const currentNoteId = useMemo(() => {
    const id = router.query.id;
    return id && typeof id === 'string' ? id : undefined;
  }, [router]);

  const [closedNodeIds, setClosedNodeIds] = useState<string[]>(
    collapseAll ? data.map((node) => node.id) : []
  );

  const onArrowClick = useCallback(
    (node: FlattenedNoteTreeItem) =>
      node.collapsed
        ? setClosedNodeIds(closedNodeIds.filter((id) => id !== node.id))
        : setClosedNodeIds([...closedNodeIds, node.id]),
    [closedNodeIds]
  );

  const flattenNode = useCallback(
    (node: NoteTreeItem, depth: number, result: FlattenedNoteTreeItem[]) => {
      const { id, children } = node;
      const collapsed = closedNodeIds.includes(id);
      result.push({ id, depth, collapsed });

      if (!collapsed && children) {
        for (const child of children) {
          flattenNode(child, depth + 1, result);
        }
      }
    },
    [closedNodeIds]
  );

  const flattenedData = useMemo(() => {
    const result: FlattenedNoteTreeItem[] = [];
    for (const node of data) {
      flattenNode(node, 0, result);
    }
    return result;
  }, [data, flattenNode]);

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtual({
    size: flattenedData.length,
    parentRef,
  });

  return (
    <div ref={parentRef} className={className}>
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => {
          const node = flattenedData[virtualRow.index];
          return (
            <SidebarNoteLink
              key={node.id}
              ref={virtualRow.measureRef}
              node={node}
              onArrowClick={() => onArrowClick(node)}
              isHighlighted={node.id === currentNoteId}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default memo(SidebarNotesTree);
