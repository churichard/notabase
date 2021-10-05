import { render, screen, act } from '@testing-library/react';
import { v4 as uuidv4 } from 'uuid';
import Editor from 'components/editor/Editor';
import { getDefaultEditorValue } from 'editor/constants';
import { store } from 'lib/store';
import { AuthContext } from 'utils/useAuth';

describe('Editor', () => {
  const noteId = uuidv4();

  const renderEditor = () => {
    const auth = {
      isLoaded: true,
      user: {
        id: '1',
        app_metadata: {},
        user_metadata: {},
        aud: '',
        created_at: new Date().toISOString(),
      },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    };
    render(
      <AuthContext.Provider value={auth}>
        <Editor noteId={noteId} onChange={jest.fn()} />
      </AuthContext.Provider>
    );
  };

  beforeAll(() => {
    // Initialize notes
    act(() => {
      const date = new Date().toISOString();
      store.getState().setNotes({
        [noteId]: {
          id: noteId,
          title: 'Test',
          content: getDefaultEditorValue(),
          user_id: '1',
          created_at: date,
          updated_at: date,
        },
      });
    });
  });

  it('renders editor and placeholder', () => {
    renderEditor();

    const editor = screen.getByRole('textbox');
    expect(editor).toBeInTheDocument();

    const placeholder = screen.getByText('Start typing here…');
    expect(placeholder).toBeInTheDocument();
  });
});
