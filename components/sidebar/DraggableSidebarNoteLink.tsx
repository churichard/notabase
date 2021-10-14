import {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
} from 'react';
import { useSortable } from '@dnd-kit/sortable';
import classNames from 'classnames';
import SidebarNoteLink from './SidebarNoteLink';
import { FlattenedNoteTreeItem } from './SidebarNotesTree';

type Props = {
  node: FlattenedNoteTreeItem;
  isHighlighted?: boolean;
  style?: CSSProperties;
};

const DraggableSidebarNoteLink = (
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>
) => {
  const { node, isHighlighted, style } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    over,
    isSorting,
    isDragging,
  } = useSortable({
    id: node.id,
  });

  const ref = useCallback(
    (node) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
      setNodeRef(node);
    },
    [forwardedRef, setNodeRef]
  );

  const className = classNames(
    { invisible: isDragging },
    {
      '!bg-primary-100 dark:!bg-primary-900': isSorting && over?.id === node.id,
    }
  );

  return (
    <SidebarNoteLink
      ref={ref}
      className={className}
      node={node}
      isHighlighted={isHighlighted}
      style={{ ...style, transition }}
      {...attributes}
      {...listeners}
    />
  );
};

export default memo(forwardRef(DraggableSidebarNoteLink));
