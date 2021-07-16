import { useMemo } from 'react';
import Head from 'next/head';
import { createEditor, Editor, Element, Node } from 'slate';
import AppLayout from 'components/AppLayout';
import type { NoteLink } from 'types/slate';
import { ElementType } from 'types/slate';
import type { GraphData } from 'components/ForceGraph';
import ForceGraph from 'components/ForceGraph';
import GraphHeader from 'components/GraphHeader';
import { useStore, deepEqual } from 'lib/store';
import ErrorBoundary from 'components/ErrorBoundary';

export default function Graph() {
  const notes = useStore((state) => state.notes, deepEqual);

  // Compute graph data
  const graphData: GraphData = useMemo(() => {
    const data: GraphData = { nodes: [], links: [] };
    for (const note of Object.values(notes)) {
      const editor = createEditor();
      editor.children = note.content;

      // Find note link elements that match noteId
      const matchingElements = Editor.nodes(editor, {
        at: [],
        match: (n) =>
          Element.isElement(n) &&
          n.type === ElementType.NoteLink &&
          !!Node.string(n), // We ignore note links with empty link text
      });

      let numOfLinks = 0;
      for (const [node] of matchingElements) {
        numOfLinks++;
        const noteLinkElement = node as NoteLink;
        data.links.push({
          source: note.id,
          target: noteLinkElement.noteId,
        });
      }

      data.nodes.push({
        id: note.id,
        name: note.title,
        radius: getRadius(numOfLinks),
      });
    }
    return data;
  }, [notes]);

  return (
    <>
      <Head>
        <title>Graph View | Notabase</title>
      </Head>
      <AppLayout className="max-w-screen">
        <ErrorBoundary>
          <div className="flex flex-1">
            <GraphHeader />
            <ForceGraph data={graphData} className="flex-1" />
          </div>
        </ErrorBoundary>
      </AppLayout>
    </>
  );
}

const getRadius = (numOfLinks: number) => {
  const BASE_RADIUS = 3;
  const LINK_MULTIPLIER = 0.5;
  return BASE_RADIUS + LINK_MULTIPLIER * numOfLinks;
};
