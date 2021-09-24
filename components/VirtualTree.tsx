import { useState, useMemo, useCallback, memo } from 'react';
import List, { ListRowProps } from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import CellMeasurer, {
  CellMeasurerCache,
} from 'react-virtualized/dist/commonjs/CellMeasurer';
import { FlattenedTreeNode, TreeNode as TreeNodeType } from './Tree';
import TreeNode from './TreeNode';

const cellMeasurerCache = new CellMeasurerCache({
  defaultHeight: 32,
  fixedWidth: true,
});

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

  const Row = useCallback(
    ({ index, style, parent }: ListRowProps) => {
      const node = flattenedData[index];
      return (
        <CellMeasurer
          key={node.id}
          cache={cellMeasurerCache}
          columnIndex={0}
          parent={parent}
          rowIndex={index}
        >
          {({ registerChild }) => (
            <TreeNode
              ref={
                registerChild as (element: HTMLDivElement) => void | undefined
              }
              node={node}
              onClick={onNodeClick}
              style={style}
            />
          )}
        </CellMeasurer>
      );
    },
    [flattenedData, onNodeClick]
  );

  return (
    <div className={className}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={flattenedData.length}
            deferredMeasurementCache={cellMeasurerCache}
            rowHeight={cellMeasurerCache.rowHeight}
            rowRenderer={Row}
          />
        )}
      </AutoSizer>
    </div>
  );
}

export default memo(VirtualTree);
