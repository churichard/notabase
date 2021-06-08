import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createEditor, Descendant, Editor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { useCurrentNote } from 'utils/useCurrentNote';
import type { Backlink, BacklinkMatch } from 'editor/useBacklinks';
import useBacklinks from 'editor/useBacklinks';
import useOnNoteLinkClick from 'editor/useOnNoteLinkClick';
import withLinks from 'editor/plugins/withLinks';
import EditorElement from './EditorElement';
import EditorLeaf from './EditorLeaf';

type Props = {
  className: string;
};

export default function Backlinks(props: Props) {
  const { className } = props;
  const currentNote = useCurrentNote();
  const { linkedBacklinks, unlinkedBacklinks } = useBacklinks(currentNote.id);

  const numOfLinkedMatches = useMemo(
    () => getNumOfMatches(linkedBacklinks),
    [linkedBacklinks]
  );
  const numOfUnlinkedMatches = useMemo(
    () => getNumOfMatches(unlinkedBacklinks),
    [unlinkedBacklinks]
  );

  return (
    <div className={`bg-gray-50 rounded py-4 ${className}`}>
      <BacklinkReferences
        title={`${numOfLinkedMatches} Linked References`}
        backlinks={linkedBacklinks}
      />
      <BacklinkReferences
        title={`${numOfUnlinkedMatches} Unlinked References`}
        backlinks={unlinkedBacklinks}
        className="pt-2"
      />
    </div>
  );
}

const getNumOfMatches = (backlinks: Backlink[]) =>
  backlinks.reduce(
    (numOfMatches, backlink) => numOfMatches + backlink.matches.length,
    0
  );

type BacklinkReferencesProps = {
  title: string;
  backlinks: Backlink[];
  className?: string;
};

const BacklinkReferences = (props: BacklinkReferencesProps) => {
  const { title, backlinks, className } = props;

  return (
    <div className={className}>
      <p className="px-4 text-lg text-gray-800">{title}</p>
      {backlinks.length > 0 ? (
        <div className="mx-2 mt-2">
          {backlinks.map((backlink) => (
            <BacklinkNoteBlock key={backlink.id} backlink={backlink} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

type BacklinkNoteBlockProps = {
  backlink: Backlink;
};

const BacklinkNoteBlock = (props: BacklinkNoteBlockProps) => {
  const { backlink } = props;
  const onNoteLinkClick = useOnNoteLinkClick();

  const matches = useMemo(() => {
    const matches: Array<BacklinkMatch> = [];
    const paths: Record<string, boolean> = {};

    for (const match of backlink.matches) {
      const pathKey = match.linePath.toString();
      if (!paths[pathKey]) {
        matches.push(match);
        paths[pathKey] = true;
      }
    }

    return matches;
  }, [backlink]);

  return (
    <button
      key={backlink.id}
      className="block w-full p-2 text-left rounded hover:bg-gray-200 active:bg-gray-300"
      onClick={() => onNoteLinkClick(backlink.id)}
    >
      <span className="block text-sm text-gray-800">{backlink.title}</span>
      {matches.map((match, index) => (
        <BacklinkMatchBlock key={index} match={match} />
      ))}
    </button>
  );
};

type BacklinkMatchBlockProps = {
  match: BacklinkMatch;
};

const BacklinkMatchBlock = (props: BacklinkMatchBlockProps) => {
  const { match } = props;

  const editorRef = useRef<Editor>();
  if (!editorRef.current) {
    editorRef.current = withLinks(withReact(createEditor()));
  }
  const editor = editorRef.current;

  const renderElement = useCallback(
    (props) => <EditorElement {...props} />,
    []
  );
  const renderLeaf = useCallback((props) => <EditorLeaf {...props} />, []);

  const [value, setValue] = useState<Descendant[]>([match.lineElement]);

  useEffect(() => {
    setValue([match.lineElement]);
  }, [match.lineElement]);

  return (
    <span className="block my-1 text-xs text-gray-600 break-words">
      <Slate editor={editor} value={value} onChange={setValue}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          readOnly
        />
      </Slate>
    </span>
  );
};
