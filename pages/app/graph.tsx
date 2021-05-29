import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { createEditor, Editor, Element, Node } from 'slate';
import { createClient } from '@supabase/supabase-js';
import type { Note } from 'types/supabase';
import AppLayout from 'components/AppLayout';
import type { NoteLink } from 'types/slate';
import { ElementType } from 'types/slate';
import type { GraphData } from 'components/ForceGraph';
import ForceGraph from 'components/ForceGraph';
import type { Notes } from 'lib/store';
import { useStore } from 'lib/store';

type Props = {
  initialNotes: Notes;
};

export default function Graph(props: Props) {
  const { initialNotes } = props;
  const notes = useStore((state) => state.notes);

  // Set graph dimensions
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setDimensions({ width: cr.width, height: cr.height });
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.unobserve(container);
  }, []);

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
      <AppLayout initialNotes={initialNotes} className="max-w-screen">
        <div ref={containerRef} className="flex-1">
          <ForceGraph
            data={graphData}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute"
          />
        </div>
      </AppLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  // Create admin supabase client on server
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_KEY ?? ''
  );

  // Get authed user
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { destination: '/login', permanent: false } };
  }

  // Get notes from database
  const { data: notes } = await supabase
    .from<Note>('notes')
    .select('id, title, content')
    .eq('user_id', user.id)
    .order('title');

  return {
    props: {
      initialNotes:
        notes?.reduce<Record<Note['id'], Note>>((acc, note) => {
          acc[note.id] = note;
          return acc;
        }, {}) ?? {},
    },
  };
};

const getRadius = (numOfLinks: number) => {
  const BASE_RADIUS = 3;
  const LINK_MULTIPLIER = 0.5;
  return BASE_RADIUS + LINK_MULTIPLIER * numOfLinks;
};
