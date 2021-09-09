import { CSSProperties, ForwardedRef, forwardRef, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
import SidebarNoteLink from './SidebarNoteLink';
import { FlattenedNoteTreeItem } from './SidebarNotesTree';

type Props = {
  node: FlattenedNoteTreeItem;
  onArrowClick: () => void;
  isHighlighted?: boolean;
  style?: CSSProperties;
};

const DraggableSidebarNoteLink = (
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>
) => {
  const { node, onArrowClick, isHighlighted, style } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    // transform, // TODO: fix this
    over,
    isSorting,
    isDragging,
  } = useSortable({
    id: node.id,
  });

  return (
    <SidebarNoteLink
      ref={(node) => {
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
        setNodeRef(node);
      }}
      className={`${isDragging ? 'invisible' : ''} ${
        isSorting && over?.id === node.id ? '!bg-primary-100' : ''
      }`}
      node={node}
      isHighlighted={isHighlighted}
      onArrowClick={onArrowClick}
      style={{
        ...style,
        transition,
        touchAction: 'none',
        // transform: CSS.Transform.toString(transform),
      }}
      {...attributes}
      {...listeners}
    />
  );
};

export default memo(forwardRef(DraggableSidebarNoteLink));
