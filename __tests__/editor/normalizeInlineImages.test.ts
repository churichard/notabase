import type { Descendant } from 'slate';
import { normalizeInlineImages } from 'editor/normalizeInlineImages';
import { uploadImage } from 'editor/plugins/withImages';
import { store } from 'lib/store';
import { BillingFrequency, PlanId } from 'constants/pricing';
import { ElementType } from 'types/slate';

jest.mock('editor/plugins/withImages', () => ({
  uploadImage: jest.fn(),
}));

const DATA_URL = 'data:image/png;base64,abc';

const imageNode = (url: string): Descendant =>
  ({
    id: 'image-1',
    type: ElementType.Image,
    url,
    children: [{ text: '' }],
  } as Descendant);

const paragraphNode = (children: Descendant[]): Descendant =>
  ({
    id: 'paragraph-1',
    type: ElementType.Paragraph,
    children,
  } as Descendant);

describe('normalizeInlineImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['test'])),
    });
  });

  describe('on the basic plan', () => {
    beforeEach(() => {
      store.setState({ billingDetails: { planId: PlanId.Basic } });
    });

    it('strips embedded images and keeps the rest of the content', async () => {
      const paragraph = paragraphNode([{ text: 'Hello' }]);
      const result = await normalizeInlineImages([
        paragraph,
        imageNode(DATA_URL),
      ]);

      expect(result.content).toEqual([paragraph]);
      expect(result.numOfStrippedImages).toBe(1);
      expect(uploadImage).not.toHaveBeenCalled();
    });

    it('leaves an empty text node when stripping empties an element', async () => {
      const result = await normalizeInlineImages([
        paragraphNode([imageNode(DATA_URL)]),
      ]);

      expect(result.content).toEqual([paragraphNode([{ text: '' }])]);
      expect(result.numOfStrippedImages).toBe(1);
    });

    it('keeps images with regular urls', async () => {
      const image = imageNode('https://example.com/image.png');
      const result = await normalizeInlineImages([image]);

      expect(result.content).toEqual([image]);
      expect(result.numOfStrippedImages).toBe(0);
      expect(uploadImage).not.toHaveBeenCalled();
    });
  });

  describe('on the pro plan', () => {
    beforeEach(() => {
      store.setState({
        billingDetails: {
          planId: PlanId.Pro,
          frequency: BillingFrequency.Monthly,
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
        },
      });
    });

    it('uploads embedded images and replaces their urls', async () => {
      (uploadImage as jest.Mock).mockResolvedValue(
        'https://example.com/signed-url'
      );

      const result = await normalizeInlineImages([imageNode(DATA_URL)]);

      expect(result.content).toEqual([
        imageNode('https://example.com/signed-url'),
      ]);
      expect(result.numOfStrippedImages).toBe(0);
      expect(uploadImage).toHaveBeenCalled();
    });

    it('throws if an embedded image fails to upload', async () => {
      (uploadImage as jest.Mock).mockResolvedValue(null);

      await expect(
        normalizeInlineImages([imageNode(DATA_URL)])
      ).rejects.toThrow('The embedded image could not be uploaded.');
    });
  });
});
