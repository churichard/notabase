import { render, screen, act } from '@testing-library/react';
import { Notes, store } from 'lib/store';
import Graph from 'pages/app/graph';
import notes from '__fixtures__/notes';
import { ElementType } from 'types/slate';

describe('Graph', () => {
  it('renders graph canvas', () => {
    act(() => {
      store.getState().setNotes(notes);
    });

    render(<Graph />);

    const canvas = screen.getByTestId('graph-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders graph canvas if a note links to a nonexistent note', () => {
    act(() => {
      const notes: Notes = {};

      notes['note-1'] = {
        id: 'note-1',
        title: `Note`,
        content: [
          {
            id: 'node-1',
            type: ElementType.Paragraph,
            children: [
              {
                id: 'node-2',
                type: ElementType.Paragraph,
                children: [
                  {
                    text: 'This is a paragraph',
                  },
                ],
              },
              {
                id: 'node-3',
                type: ElementType.Paragraph,
                children: [
                  {
                    text: 'Linking to ',
                  },
                  {
                    id: 'node-4',
                    type: ElementType.NoteLink,
                    noteId: 'note-2',
                    children: [
                      {
                        text: 'new note',
                      },
                    ],
                    noteTitle: 'new note',
                  },
                  {
                    text: '. ',
                  },
                ],
              },
            ],
          },
        ],
        user_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      store.getState().setNotes(notes);
    });

    render(<Graph />);

    const canvas = screen.getByTestId('graph-canvas');
    expect(canvas).toBeInTheDocument();
  });
});
