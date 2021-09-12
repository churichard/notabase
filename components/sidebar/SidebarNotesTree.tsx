import { useState, useMemo, useCallback, memo, useRef } from 'react';
import { useVirtual } from 'react-virtual';
import { useRouter } from 'next/router';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'react-toastify';
import { NoteTreeItem, store, useStore } from 'lib/store';
import Portal from 'components/Portal';
import supabase from 'lib/supabase';
import { User } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import SidebarNoteLink from './SidebarNoteLink';
import DraggableSidebarNoteLink from './DraggableSidebarNoteLink';

export type FlattenedNoteTreeItem = {
  id: string;
  depth: number;
  collapsed: boolean;
};

type Props = {
  data: NoteTreeItem[];
  className?: string;
};

function SidebarNotesTree(props: Props) {
  const { data, className } = props;

  const { user } = useAuth();
  const router = useRouter();
  const currentNoteId = useMemo(() => {
    const id = router.query.id;
    return id && typeof id === 'string' ? id : undefined;
  }, [router]);

  const moveNoteTreeItem = useStore((state) => state.moveNoteTreeItem);
  const toggleNoteTreeItemCollapsed = useStore(
    (state) => state.toggleNoteTreeItemCollapsed
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onArrowClick = useCallback(
    (node: FlattenedNoteTreeItem) => toggleNoteTreeItemCollapsed(node.id),
    [toggleNoteTreeItemCollapsed]
  );

  const flattenNode = useCallback(
    (node: NoteTreeItem, depth: number, result: FlattenedNoteTreeItem[]) => {
      const { id, children } = node;
      const collapsed = node.collapsed;
      result.push({ id, depth, collapsed });

      if (!collapsed && children.length > 0) {
        for (const child of children) {
          flattenNode(child, depth + 1, result);
        }
      }
    },
    []
  );

  const flattenedData = useMemo(() => {
    const result: FlattenedNoteTreeItem[] = [];
    for (const node of data) {
      flattenNode(node, 0, result);
    }
    return result;
  }, [data, flattenNode]);

  const resetState = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && user) {
        moveNoteTreeItem(active.id, over.id);
        await supabase
          .from<User>('users')
          .update({ note_tree: store.getState().noteTree })
          .eq('id', user.id);
      } else {
        toast.error(
          'There was an unexpected error: you are not logged in and your changes could not be saved.'
        );
      }

      resetState();
    },
    [resetState, moveNoteTreeItem, user]
  );

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtual({
    size: flattenedData.length,
    parentRef,
    estimateSize: useCallback(() => 32, []),
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={flattenedData}
            strategy={verticalListSortingStrategy}
          >
            {rowVirtualizer.virtualItems.map((virtualRow) => {
              const node = flattenedData[virtualRow.index];
              return (
                <DraggableSidebarNoteLink
                  key={node.id}
                  ref={virtualRow.measureRef}
                  node={node}
                  onArrowClick={() => onArrowClick(node)}
                  isHighlighted={node.id === currentNoteId}
                  style={{
                    position: 'absolute',
                    top: virtualRow.start,
                    left: 0,
                    width: '100%',
                  }}
                />
              );
            })}
          </SortableContext>
          <Portal>
            <DragOverlay>
              {activeId ? (
                <SidebarNoteLink
                  node={
                    flattenedData.find((node) => node.id === activeId) ?? {
                      id: activeId,
                      depth: 0,
                      collapsed: false,
                    }
                  }
                  className="shadow-popover !bg-gray-50 dark:!bg-gray-800"
                />
              ) : null}
            </DragOverlay>
          </Portal>
        </DndContext>
      </div>
    </div>
  );
}

export default memo(SidebarNotesTree);
