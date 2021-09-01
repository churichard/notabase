import { memo, useMemo } from 'react';
import { useRouter } from 'next/router';
import { BacklinkMatch } from 'editor/backlinks/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';
import EditorElement from '../elements/EditorElement';
import EditorLeaf from '../elements/EditorLeaf';
import { ReadOnlyEditor } from '../ReadOnlyEditor';

type BacklinkMatchLeafProps = {
  noteId: string;
  match: BacklinkMatch;
  className?: string;
};

const BacklinkMatchLeaf = (props: BacklinkMatchLeafProps) => {
  const { noteId, match, className } = props;
  const onNoteLinkClick = useOnNoteLinkClick();
  const isPageStackingOn = useStore((state) => state.isPageStackingOn);
  const router = useRouter();

  const backlinkMatch = useMemo(
    () => (
      <ReadOnlyEditor
        value={[match.lineElement]}
        renderElement={EditorElement}
        renderLeaf={EditorLeaf}
      />
    ),
    [match.lineElement]
  );
  const containerClassName = `block text-left text-xs rounded p-2 my-1 w-full break-words ${className}`;

  return (
    <button
      className={containerClassName}
      onClick={() => {
        if (isPageStackingOn) {
          onNoteLinkClick(noteId, match.linePath);
        } else {
          const hash = `#0-${match.linePath}`;
          router.push(`/app/note/${noteId}${hash}`);
        }
      }}
    >
      {backlinkMatch}
    </button>
  );
};

export default memo(BacklinkMatchLeaf);
