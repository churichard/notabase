import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  memo,
  useCallback,
  useMemo,
} from 'react';
import { IconCaretRight, IconFile } from '@tabler/icons';
import { useStore } from 'lib/store';
import { isMobile } from 'utils/device';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import SidebarItem from './SidebarItem';
import SidebarNoteLinkDropdown from './SidebarNoteLinkDropdown';
import { FlattenedNoteTreeItem } from './SidebarNotesTree';

interface Props extends HTMLAttributes<HTMLDivElement> {
  node: FlattenedNoteTreeItem;
  isHighlighted?: boolean;
}

const SidebarNoteLink = (
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>
) => {
  const { node, isHighlighted, className = '', style, ...otherProps } = props;

  const note = useStore((state) => state.notes[node.id]);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const lastOpenNoteId = useStore(
    (state) => state.openNoteIds[state.openNoteIds.length - 1]
  );
  const { onClick: onNoteLinkClick } = useOnNoteLinkClick(lastOpenNoteId);

  const toggleNoteTreeItemCollapsed = useStore(
    (state) => state.toggleNoteTreeItemCollapsed
  );

  const onArrowClick = useCallback(
    () => toggleNoteTreeItemCollapsed(node.id),
    [node, toggleNoteTreeItemCollapsed]
  );

  // We add 20px for every level of nesting, plus 4px base padding
  const leftPadding = useMemo(() => node.depth * 20 + 4, [node.depth]);

  return (
    <SidebarItem
      ref={forwardedRef}
      className={`group relative flex items-center justify-between overflow-x-hidden focus:outline-none ${className}`}
      isHighlighted={isHighlighted}
      style={style}
      {...otherProps}
    >
      <div
        role="button"
        className="flex flex-1 select-none items-center overflow-hidden overflow-ellipsis whitespace-nowrap px-2 py-1"
        onClick={(e) => {
          e.preventDefault();
          onNoteLinkClick(note.id, e.shiftKey);
          if (isMobile()) {
            setIsSidebarOpen(false);
          }
        }}
        style={{ paddingLeft: `${leftPadding}px` }}
        draggable={false}
      >
        {node.hasChildren ? (
          <button
            className="rounded p-1 hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-600 dark:active:bg-gray-500"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onArrowClick?.();
            }}
          >
            <IconCaretRight
              className={`flex-shrink-0 transform text-gray-500 transition-transform dark:text-gray-100 ${
                !node.collapsed ? 'rotate-90' : ''
              }`}
              size={16}
              fill="currentColor"
            />
          </button>
        ) : null}
        <IconFile
          className={`mr-1 flex-shrink-0 text-gray-500 dark:text-gray-100 ${
            !node.hasChildren ? 'ml-6' : ''
          }`}
          size={16}
        />
        <span
          className="overflow-hidden overflow-ellipsis whitespace-nowrap text-sm"
          data-testid="sidebar-note-link"
          title={note.title}
        >
          {note.title}
        </span>
      </div>
      <SidebarNoteLinkDropdown
        note={note}
        className="opacity-0.1 group-hover:opacity-100"
      />
    </SidebarItem>
  );
};

export default memo(forwardRef(SidebarNoteLink));
