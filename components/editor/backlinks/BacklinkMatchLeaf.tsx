import { memo, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { BacklinkMatch } from 'editor/backlinks/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';
import EditorElement, { EditorElementProps } from '../elements/EditorElement';
import EditorLeaf, { EditorLeafProps } from '../elements/EditorLeaf';
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

  const renderElement = useCallback(
    (props: EditorElementProps) => <EditorElement {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: EditorLeafProps) => <EditorLeaf {...props} />,
    []
  );

  const backlinkMatch = useMemo(
    () => (
      <ReadOnlyEditor
        value={[match.lineElement]}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    ),
    [match.lineElement, renderElement, renderLeaf]
  );
  const containerClassName = `block text-left text-xs text-gray-600 bg-gray-50 dark:text-gray-100 dark:bg-gray-800 rounded p-2 my-1 w-full break-words ${className}`;

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
