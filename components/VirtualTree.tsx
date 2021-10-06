import { useState, useMemo, useCallback, memo, useRef } from 'react';
import { useVirtual } from 'react-virtual';
import { FlattenedTreeNode, TreeNode as TreeNodeType } from './Tree';
import TreeNode from './TreeNode';

type Props = {
  data: TreeNodeType[];
  className?: string;
  collapseAll?: boolean;
};

function VirtualTree(props: Props) {
  const { data, className, collapseAll = false } = props;

  const [closedNodeIds, setClosedNodeIds] = useState<string[]>(
    collapseAll ? data.map((node) => node.id) : []
  );

  const onNodeClick = useCallback(
    (node: FlattenedTreeNode) =>
      node.collapsed
        ? setClosedNodeIds((closedNodeIds) =>
            closedNodeIds.filter((id) => id !== node.id)
          )
        : setClosedNodeIds((closedNodeIds) => [...closedNodeIds, node.id]),
    []
  );

  const flattenNode = useCallback(
    (node: TreeNodeType, depth: number, result: FlattenedTreeNode[]) => {
      const { id, labelNode, children, showArrow } = node;
      const collapsed = closedNodeIds.includes(id);
      result.push({
        id,
        labelNode,
        showArrow: showArrow ?? true,
        hasChildren: (children ?? []).length > 0,
        depth,
        collapsed,
      });

      if (!collapsed && children) {
        for (const child of children) {
          flattenNode(child, depth + 1, result);
        }
      }
    },
    [closedNodeIds]
  );

  const flattenedData = useMemo(() => {
    const result: FlattenedTreeNode[] = [];
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
            <TreeNode
              key={node.id}
              ref={virtualRow.measureRef}
              node={node}
              onClick={onNodeClick}
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

export default memo(VirtualTree);
