import { useState, useMemo, useCallback, memo } from 'react';
import List from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import { useRouter } from 'next/router';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
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

  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const flattenNode = useCallback(
    (node: NoteTreeItem, depth: number, result: FlattenedNoteTreeItem[]) => {
      const { id, children, collapsed } = node;
      result.push({ id, depth, collapsed });

      /**
       * Only push in children if:
       * 1. The node is not collapsed
       * 2. The node has children
       * 3. The node is not the active node (i.e. being dragged)
       */
      if (!collapsed && children.length > 0 && node.id !== activeId) {
        for (const child of children) {
          flattenNode(child, depth + 1, result);
        }
      }
    },
    [activeId]
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

  const Row = useCallback(
    ({ index, key, style }) => {
      const node = flattenedData[index];
      return (
        <DraggableSidebarNoteLink
          key={key}
          node={node}
          isHighlighted={node.id === currentNoteId}
          style={style}
        />
      );
    },
    [currentNoteId, flattenedData]
  );

  return (
    <div className={className}>
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
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                rowCount={flattenedData.length}
                rowHeight={34}
                rowRenderer={Row}
              />
            )}
          </AutoSizer>
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
  );
}

export default memo(SidebarNotesTree);
