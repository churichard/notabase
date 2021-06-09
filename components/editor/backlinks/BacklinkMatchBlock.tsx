import React, { memo, useCallback } from 'react';
import { BacklinkMatch } from 'editor/useBacklinks';
import EditorElement from '../EditorElement';
import EditorLeaf from '../EditorLeaf';
import { ReadOnlyEditor } from '../ReadOnlyEditor';

type BacklinkMatchBlockProps = {
  match: BacklinkMatch;
};

const BacklinkMatchBlock = (props: BacklinkMatchBlockProps) => {
  const { match } = props;

  const renderElement = useCallback(
    (props) => <EditorElement {...props} />,
    []
  );
  const renderLeaf = useCallback((props) => <EditorLeaf {...props} />, []);

  return (
    <span className="block my-1 text-xs text-gray-600 break-words">
      <ReadOnlyEditor
        value={[match.lineElement]}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </span>
  );
};

export default memo(BacklinkMatchBlock);
