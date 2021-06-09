import React, { memo, useMemo } from 'react';
import { IconCaretDown, IconCaretRight } from '@tabler/icons';
import { FlattenedTreeNode } from './Tree';

type NodeProps = {
  node: FlattenedTreeNode;
  onClick: (node: FlattenedTreeNode) => void;
};

const TreeNode = (props: NodeProps) => {
  const { node, onClick } = props;

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
      className={`flex items-center py-1 ${
        node.showArrow ? 'hover:cursor-pointer' : ''
      }`}
      style={{ paddingLeft: `${leftPadding}px` }}
      onClick={node.showArrow ? () => onClick(node) : undefined}
    >
      {node.showArrow ? (
        <Icon className="mr-1 text-gray-500" size={16} fill="currentColor" />
      ) : null}
      {node.labelNode}
    </div>
  );
};

export default memo(TreeNode);
