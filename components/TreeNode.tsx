import {
  memo,
  useMemo,
  CSSProperties,
  forwardRef,
  ForwardedRef,
  useCallback,
} from 'react';
import { IconCaretRight } from '@tabler/icons';
import useResizeObserver from 'use-resize-observer';
import { FlattenedTreeNode } from './Tree';

type Props = {
  node: FlattenedTreeNode;
  onClick: (node: FlattenedTreeNode) => void;
  style?: CSSProperties;
  onResize?: () => void;
};

const TreeNode = (props: Props, forwardedRef: ForwardedRef<HTMLDivElement>) => {
  const { node, onClick, style, onResize } = props;
  const { ref: resizeObserverRef } = useResizeObserver<HTMLDivElement>({
    onResize,
  });

  const leftPadding = useMemo(() => {
    let padding = node.depth * 16;
    if (!node.showArrow) {
      padding += 4;
    }
    return padding;
  }, [node.depth, node.showArrow]);

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
      resizeObserverRef(node);
    },
    [forwardedRef, resizeObserverRef]
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
        <IconCaretRight
          className={`flex-shrink-0 mr-1 text-gray-500 dark:text-gray-100 transform transition-transform ${
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
