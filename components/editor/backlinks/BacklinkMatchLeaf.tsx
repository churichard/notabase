import { memo, useCallback } from 'react';
import { BacklinkMatch } from 'editor/useBacklinks';
import EditorElement from '../EditorElement';
import EditorLeaf from '../EditorLeaf';
import { ReadOnlyEditor } from '../ReadOnlyEditor';

type BacklinkMatchLeafProps = {
  match: BacklinkMatch;
  className?: string;
};

const BacklinkMatchLeaf = (props: BacklinkMatchLeafProps) => {
  const { match, className } = props;

  const renderElement = useCallback(
    (props) => <EditorElement omitVerticalSpacing={true} {...props} />,
    []
  );
  const renderLeaf = useCallback((props) => <EditorLeaf {...props} />, []);

  return (
    <span
      className={`block text-xs text-gray-600 bg-gray-50 rounded p-2 w-full break-words ${className}`}
    >
      <ReadOnlyEditor
        value={[match.lineElement]}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </span>
  );
};

export default memo(BacklinkMatchLeaf);
