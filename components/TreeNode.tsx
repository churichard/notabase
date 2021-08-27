import { memo, useMemo, CSSProperties, forwardRef, ForwardedRef } from 'react';
import { IconCaretDown, IconCaretRight } from '@tabler/icons';
import { FlattenedTreeNode } from './Tree';

type NodeProps = {
  node: FlattenedTreeNode;
  onClick: (node: FlattenedTreeNode) => void;
  style?: CSSProperties;
};

const TreeNode = (props: NodeProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { node, onClick, style } = props;

  const leftPadding = useMemo(() => {
    let padding = node.depth * 16;
    if (!node.showArrow) {
      padding += 4;
    }
    return padding;
  }, [node.depth, node.showArrow]);

  const Icon = useMemo(
    () => (node.collapsed ? IconCaretRight : IconCaretDown),
    [node.collapsed]
  );

  return (
    <div
      ref={ref}
      className={`flex items-center select-none ${
        node.showArrow ? 'hover:cursor-pointer' : ''
      }`}
      style={{ paddingLeft: `${leftPadding}px`, ...style }}
      onClick={node.showArrow ? () => onClick(node) : undefined}
    >
      {node.showArrow ? (
        <Icon
          className="flex-shrink-0 mr-1 text-gray-500"
          size={16}
          fill="currentColor"
        />
      ) : null}
      {node.labelNode}
    </div>
  );
};

export default memo(forwardRef(TreeNode));
