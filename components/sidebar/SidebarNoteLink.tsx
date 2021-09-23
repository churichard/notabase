import { ForwardedRef, forwardRef, HTMLAttributes, memo, useMemo } from 'react';
import { IconCaretRight } from '@tabler/icons';
import { useStore } from 'lib/store';
import { isMobile } from 'utils/device';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import SidebarItem from './SidebarItem';
import SidebarNoteLinkDropdown from './SidebarNoteLinkDropdown';
import { FlattenedNoteTreeItem } from './SidebarNotesTree';

interface Props extends HTMLAttributes<HTMLDivElement> {
  node: FlattenedNoteTreeItem;
  onArrowClick?: () => void;
  isHighlighted?: boolean;
}

const SidebarNoteLink = (
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>
) => {
  const {
    node,
    onArrowClick,
    isHighlighted,
    className = '',
    style,
    ...otherProps
  } = props;

  const note = useStore((state) => state.notes[node.id]);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const lastOpenNoteId = useStore(
    (state) => state.openNoteIds[state.openNoteIds.length - 1]
  );
  const { onClick: onNoteLinkClick } = useOnNoteLinkClick(lastOpenNoteId);

  // We add 16px for every level of nesting, plus 8px base padding
  const leftPadding = useMemo(() => node.depth * 16 + 8, [node.depth]);

  return (
    <SidebarItem
      ref={forwardedRef}
      className={`relative flex items-center justify-between overflow-x-hidden group ${className}`}
      isHighlighted={isHighlighted}
      style={style}
      {...otherProps}
    >
      <div
        role="button"
        className="flex items-center flex-1 px-2 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap"
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
        <button
          className="p-1 mr-1 rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-600 dark:active:bg-gray-500"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onArrowClick?.();
          }}
        >
          <IconCaretRight
            className={`flex-shrink-0 text-gray-500 dark:text-gray-100 transform transition-transform ${
              !node.collapsed ? 'rotate-90' : ''
            }`}
            size={16}
            fill="currentColor"
          />
        </button>
        <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
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
