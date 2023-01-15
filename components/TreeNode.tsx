import { memo, useMemo, CSSProperties, forwardRef, ForwardedRef } from 'react';
import { IconCaretRight } from '@tabler/icons';
import { FlattenedTreeNode } from './Tree';

type Props = {
  node: FlattenedTreeNode;
  onClick: (node: FlattenedTreeNode) => void;
  style?: CSSProperties;
};

const TreeNode = (props: Props, forwardedRef: ForwardedRef<HTMLDivElement>) => {
  const { node, onClick, style } = props;

  const leftPadding = useMemo(() => {
    let padding = node.depth * 16;
    if (!node.showArrow) {
      padding += 4;
    }
    return padding;
  }, [node.depth, node.showArrow]);

  return (
    <div
      ref={forwardedRef}
      className={`flex select-none items-center ${
        node.showArrow ? 'hover:cursor-pointer' : ''
      }`}
      style={{ paddingLeft: `${leftPadding}px`, ...style }}
      onClick={node.showArrow ? () => onClick(node) : undefined}
    >
      {node.showArrow ? (
        <IconCaretRight
          className={`mr-1 flex-shrink-0 transform text-gray-500 transition-transform dark:text-gray-100 ${
            !node.collapsed ? 'rotate-90' : ''
          }`}
          size={16}
          fill="currentColor"
        />
      ) : null}
      {node.labelNode}
    </div>
  );
};

export default memo(forwardRef(TreeNode));
