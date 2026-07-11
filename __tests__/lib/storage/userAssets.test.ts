import { getUserAssetPaths } from 'lib/storage/userAssets';

describe('getUserAssetPaths', () => {
  const userId = 'user-123';

  it('finds unique uploaded images in nested note content', () => {
    const uploadedImage =
      'https://project.supabase.co/storage/v1/object/sign/user-assets/user-123/image.png?token=secret';
    const content = [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          { type: 'image', url: uploadedImage, children: [{ text: '' }] },
        ],
      },
      { type: 'image', url: uploadedImage, children: [{ text: '' }] },
      {
        type: 'image',
        url: 'https://example.com/external.png',
        children: [{ text: '' }],
      },
    ];

    expect(getUserAssetPaths(content, userId)).toEqual(['user-123/image.png']);
  });

  it('ignores assets that belong to another user', () => {
    const content = [
      {
        type: 'image',
        url: 'https://project.supabase.co/storage/v1/object/sign/user-assets/another-user/image.png?token=secret',
        children: [{ text: '' }],
      },
    ];

    expect(getUserAssetPaths(content, userId)).toEqual([]);
  });

  it('handles missing or malformed content', () => {
    expect(getUserAssetPaths(undefined, userId)).toEqual([]);
    expect(
      getUserAssetPaths([{ type: 'image', url: 'not a url' }], userId)
    ).toEqual([]);
  });
});
