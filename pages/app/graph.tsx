import { useMemo } from 'react';
import Head from 'next/head';
import { createEditor, Editor, Element, Node } from 'slate';
import type { NoteLink } from 'types/slate';
import { ElementType } from 'types/slate';
import type { GraphData } from 'components/ForceGraph';
import ForceGraph from 'components/ForceGraph';
import { useStore } from 'lib/store';
import ErrorBoundary from 'components/ErrorBoundary';
import OpenSidebarButton from 'components/sidebar/OpenSidebarButton';

export default function Graph() {
  const notes = useStore((state) => state.notes);
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);

  // Compute graph data
  const graphData: GraphData = useMemo(() => {
    const data: GraphData = { nodes: [], links: [] };
    const notesArr = Object.values(notes);

    // Initialize linksByNoteId
    const linksByNoteId: Record<string, Set<string> | undefined> = {};

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

        // Create a new set if there is no set for the note id
        if (!linksByNoteId[note.id]) {
          linksByNoteId[note.id] = new Set();
        }
        if (!linksByNoteId[noteLinkElement.noteId]) {
          linksByNoteId[noteLinkElement.noteId] = new Set();
        }

        // Add the link to each note set
        linksByNoteId[note.id]?.add(noteLinkElement.noteId);
        linksByNoteId[noteLinkElement.noteId]?.add(note.id);
      }
    }

    // Create graph data
    for (const note of notesArr) {
      // Populate links
      const linkedNoteIds = linksByNoteId[note.id]?.values() ?? [];
      const numOfLinks = linksByNoteId[note.id]?.size ?? 0;
      for (const linkedNoteId of linkedNoteIds) {
        data.links.push({ source: note.id, target: linkedNoteId });
      }
      // Populate nodes
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
      <ErrorBoundary>
        {!isSidebarOpen ? (
          <OpenSidebarButton className="absolute top-0 left-0 z-10 mx-4 my-1" />
        ) : null}
        <ForceGraph data={graphData} className="flex-1" />
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
