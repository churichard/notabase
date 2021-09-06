import { CSSProperties, memo } from 'react';
import Link from 'next/link';
import { Note } from 'types/supabase';
import { useStore } from 'lib/store';
import { isMobile } from 'utils/device';
import SidebarItem from './SidebarItem';
import SidebarNoteLinkDropdown from './SidebarNoteLinkDropdown';

type Props = {
  note: Note;
  isHighlighted?: boolean;
  style?: CSSProperties;
};

const SidebarNoteLink = (props: Props) => {
  const { note, isHighlighted, style } = props;
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  return (
    <SidebarItem
      className="relative flex items-center justify-between overflow-x-hidden group"
      isHighlighted={isHighlighted}
      style={style}
      onClick={() => {
        if (isMobile()) {
          setIsSidebarOpen(false);
        }
      }}
    >
      <Link href={`/app/note/${note.id}`}>
        <a className="flex-1 px-6 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {note.title}
        </a>
      </Link>
      <SidebarNoteLinkDropdown
        note={note}
        className="hidden group-hover:block"
      />
    </SidebarItem>
  );
};

export default memo(SidebarNoteLink);
