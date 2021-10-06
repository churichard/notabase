import { render, screen, act } from '@testing-library/react';
import { store } from 'lib/store';
import Graph from 'pages/app/graph';
import notes from '__fixtures__/notes';

describe('Graph', () => {
  it('renders graph canvas', () => {
    act(() => {
      store.getState().setNotes(notes);
    });

    render(<Graph />);

    const canvas = screen.getByTestId('graph-canvas');
    expect(canvas).toBeInTheDocument();
  });
});
