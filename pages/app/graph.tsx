import { useMemo } from 'react';
import Head from 'next/head';
import { createEditor, Editor, Element, Node } from 'slate';
import type { NoteLink } from 'types/slate';
import { ElementType } from 'types/slate';
import type { GraphData } from 'components/ForceGraph';
import ForceGraph from 'components/ForceGraph';
import GraphHeader from 'components/GraphHeader';
import { useStore } from 'lib/store';
import ErrorBoundary from 'components/ErrorBoundary';

export default function Graph() {
  const notes = useStore((state) => state.notes);

  // Compute graph data
  const graphData: GraphData = useMemo(() => {
    const data: GraphData = { nodes: [], links: [] };
    const notesArr = Object.values(notes);

    // Initialize linksByNoteId
    const linksByNoteId: Record<string, Set<string>> = {};
    for (const note of notesArr) {
      linksByNoteId[note.id] = new Set();
    }

    // Search for links in each note
    for (const note of notesArr) {
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

      // Update linksByNoteId
      for (const [node] of matchingElements) {
        const noteLinkElement = node as NoteLink;
        linksByNoteId[note.id].add(noteLinkElement.noteId);
        linksByNoteId[noteLinkElement.noteId].add(note.id);
      }
    }

    // Create graph data
    for (const note of notesArr) {
      // Populate links
      for (const linkNoteId of linksByNoteId[note.id].values()) {
        data.links.push({ source: note.id, target: linkNoteId });
      }
      // Populate nodes
      data.nodes.push({
        id: note.id,
        name: note.title,
        radius: getRadius(linksByNoteId[note.id].size),
      });
    }

    return data;
  }, [notes]);

  return (
    <>
      <Head>
        <title>Graph View | Notabase</title>
      </Head>
      <ErrorBoundary>
        <div className="flex flex-1">
          <GraphHeader />
          <ForceGraph data={graphData} className="flex-1" />
        </div>
      </ErrorBoundary>
    </>
  );
}

const getRadius = (numOfLinks: number) => {
  const MAX_RADIUS = 10;
  const BASE_RADIUS = 3;
  const LINK_MULTIPLIER = 0.5;
  return Math.min(BASE_RADIUS + LINK_MULTIPLIER * numOfLinks, MAX_RADIUS);
};
