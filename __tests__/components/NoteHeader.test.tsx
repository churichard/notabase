import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteHeader from 'components/editor/NoteHeader';
import { store } from 'lib/store';
import { AuthContext } from 'utils/useAuth';
import { ProvideCurrentNote } from 'utils/useCurrentNote';
import nextRouterMock from '__mocks__/next-router';
import notes from '__fixtures__/notes';

describe('NoteHeader', () => {
  const renderNoteHeader = (currentNoteId = '1') => {
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
    return render(
      <AuthContext.Provider value={auth}>
        <ProvideCurrentNote value={{ id: currentNoteId }}>
          <NoteHeader />
        </ProvideCurrentNote>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    act(() => {
      store.getState().setNotes(notes);
    });
  });

  describe('one note', () => {
    beforeEach(() => {
      act(() => {
        store.getState().setOpenNoteIds(['1']);
      });
    });

    it('renders options menu and no close button', () => {
      renderNoteHeader();
      expect(
        screen.getByTitle('Options (export, import, etc.)')
      ).toBeInTheDocument();
      expect(screen.queryByTitle('Close pane')).not.toBeInTheDocument();
    });
  });

  describe('multiple notes', () => {
    let routerPush: jest.Mock;

    beforeEach(() => {
      routerPush = jest.fn();
      nextRouterMock.useRouter.mockImplementation(() => ({
        pathname: '/app/note',
        query: { id: '1', stack: ['2', '3'] },
        asPath: '',
        push: routerPush,
      }));
      act(() => {
        store.getState().setOpenNoteIds(['1', '2', '3']);
      });
    });

    it('renders options menu and close button', () => {
      renderNoteHeader();
      expect(
        screen.getByTitle('Options (export, import, etc.)')
      ).toBeInTheDocument();
      expect(screen.getByTitle('Close pane')).toBeInTheDocument();
    });

    it('routes to next note in stack when first note is closed', async () => {
      renderNoteHeader();
      await userEvent.click(screen.getByTitle('Close pane'));
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/app/note',
          query: { id: '2', stack: ['3'] },
        },
        undefined,
        { shallow: true }
      );
    });

    it('removes note from stack if a stacked note is closed', async () => {
      renderNoteHeader('2');
      await userEvent.click(screen.getByTitle('Close pane'));
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/app/note',
          query: { id: '1', stack: ['3'] },
        },
        undefined,
        { shallow: true }
      );
    });
  });
});
