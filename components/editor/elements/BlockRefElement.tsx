import { ReactNode, useCallback, useMemo } from 'react';
import { Node } from 'slate';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import classNames from 'classnames';
import { BlockReference, ElementType } from 'types/slate';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import { useStore } from 'lib/store';
import Tooltip from 'components/Tooltip';
import useBlockReference from 'editor/backlinks/useBlockReference';
import { useCurrentNote } from 'utils/useCurrentNote';
import ReadOnlyEditor from '../ReadOnlyEditor';
import EditorLeaf from './EditorLeaf';
import ParagraphElement from './ParagraphElement';
import EditorElement, { EditorElementProps } from './EditorElement';

type BlockRefElementProps = {
  element: BlockReference;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

export default function BlockRefElement(props: BlockRefElementProps) {
  const { className = '', element, children, attributes } = props;
  const selected = useSelected();
  const focused = useFocused();

  const blockReference = useBlockReference(element.blockId);
  const currentNote = useCurrentNote();
  const { onClick: onBlockRefClick, defaultStackingBehavior } =
    useOnNoteLinkClick(currentNote.id);

  const blockRefClassName = classNames(
    'p-0.25 border-b border-gray-200 select-none cursor-alias hover:bg-primary-50 active:bg-primary-100 dark:border-gray-700 dark:hover:bg-primary-900 dark:active:bg-primary-800',
    { 'bg-primary-100 dark:bg-primary-900': selected && focused },
    className
  );

  const noteTitle = useStore((state) =>
    blockReference ? state.notes[blockReference.noteId].title : null
  );

  const renderElement = useCallback((props: EditorElementProps) => {
    const elementType = props.element.type;
    if (elementType === ElementType.ListItem) {
      return <ParagraphElement {...props} />;
    } else {
      return <EditorElement {...props} />;
    }
  }, []);

  const editorValue = useMemo(
    () => (blockReference ? [blockReference.element] : []),
    [blockReference]
  );

  return (
    <Tooltip content={noteTitle} placement="bottom-start" disabled={!noteTitle}>
      <div
        className={blockRefClassName}
        onClick={(e) => {
          e.stopPropagation();
          if (blockReference) {
            onBlockRefClick(
              blockReference.noteId,
              defaultStackingBehavior(e),
              blockReference.path
            );
          }
        }}
        {...attributes}
      >
        {blockReference ? (
          <ReadOnlyEditor
            value={editorValue}
            renderElement={renderElement}
            renderLeaf={EditorLeaf}
          />
        ) : (
          <BlockRefError element={element} />
        )}
        {children}
      </div>
    </Tooltip>
  );
}

type BlockRefErrorProps = {
  element: BlockReference;
};

const BlockRefError = (props: BlockRefErrorProps) => {
  const { element } = props;
  return (
    <div className="font-medium text-red-500" contentEditable={false}>
      <div>
        Error: no block with id &ldquo;{element.blockId}
        &rdquo;.
      </div>
      <div>Last saved content: {Node.string(element)}</div>
    </div>
  );
};
