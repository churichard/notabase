import notes from '__fixtures__/notes';
import deleteNote from 'lib/api/deleteNote';
import { store } from 'lib/store';
import { ElementType, Image } from 'types/slate';

const selectNotes = jest.fn();
const deleteNotes = jest.fn();
const updateUser = jest.fn();
const removeAssets = jest.fn();

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));
jest.mock('lib/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn((table: string) => {
      if (table === 'notes') {
        return {
          select: jest.fn(() => ({ eq: selectNotes })),
          delete: jest.fn(() => ({ eq: deleteNotes })),
        };
      }
      return { update: jest.fn(() => ({ eq: updateUser })) };
    }),
    storage: {
      from: jest.fn(() => ({ remove: removeAssets })),
    },
  },
}));

describe('deleteNote', () => {
  const userId = '1';
  const noteId = 'note-0';
  const assetUrl =
    'https://project.supabase.co/storage/v1/object/sign/user-assets/1/image.png?token=secret';
  const image: Image = {
    id: 'image-1',
    type: ElementType.Image,
    url: assetUrl,
    children: [{ text: '' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store.getState().setNotes({
      ...notes,
      [noteId]: { ...notes[noteId], content: [image] },
    });
    deleteNotes.mockResolvedValue({ error: null });
    updateUser.mockResolvedValue({ error: null });
    removeAssets.mockResolvedValue({ error: null });
  });

  it('keeps an asset referenced by a note saved during deletion', async () => {
    selectNotes
      .mockResolvedValueOnce({ data: [notes[noteId]], error: null })
      .mockResolvedValueOnce({
        data: [{ ...notes['note-1'], content: [image] }],
        error: null,
      });

    await deleteNote(userId, noteId);

    expect(selectNotes).toHaveBeenCalledTimes(2);
    expect(removeAssets).not.toHaveBeenCalled();
  });

  it('deletes an asset that remains unreferenced', async () => {
    selectNotes
      .mockResolvedValueOnce({ data: [notes[noteId]], error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    await deleteNote(userId, noteId);

    expect(removeAssets).toHaveBeenCalledWith(['1/image.png']);
  });

  it('keeps assets when the final reference check fails', async () => {
    selectNotes
      .mockResolvedValueOnce({ data: [notes[noteId]], error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('offline') });

    await deleteNote(userId, noteId);

    expect(removeAssets).not.toHaveBeenCalled();
  });
});
