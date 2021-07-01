import { memo, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { BacklinkMatch } from 'editor/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';
import EditorElement from '../EditorElement';
import EditorLeaf from '../EditorLeaf';
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
    (props) => <EditorElement omitVerticalSpacing={true} {...props} />,
    []
  );
  const renderLeaf = useCallback((props) => <EditorLeaf {...props} />, []);

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
  const containerClassName = `block text-left text-xs text-gray-600 bg-gray-50 rounded p-2 my-1 w-full break-words ${className}`;

  return (
    <button
      className={containerClassName}
      onClick={() => {
        if (isPageStackingOn) {
          onNoteLinkClick(noteId, match.linePath);
        } else {
          router.push(`/app/note/${noteId}#${match.linePath}`);
        }
      }}
    >
      {backlinkMatch}
    </button>
  );
};

export default memo(BacklinkMatchLeaf);
