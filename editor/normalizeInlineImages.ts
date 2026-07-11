import { Element, type Descendant } from 'slate';
import { ElementType, type Image } from 'types/slate';
import { uploadImage } from './plugins/withImages';

const DATA_IMAGE_PATTERN = /^data:(image\/[a-z0-9.+-]+);base64,/i;

const dataUrlToFile = async (url: string) => {
  const match = url.match(DATA_IMAGE_PATTERN);
  if (!match) return null;
  const blob = await fetch(url).then((response) => response.blob());
  const extension = match[1].split('/')[1] || 'png';
  return new File([blob], `pasted-image.${extension}`, { type: match[1] });
};

export const normalizeInlineImages = async (
  nodes: Descendant[]
): Promise<Descendant[]> =>
  Promise.all(
    nodes.map(async (node): Promise<Descendant> => {
      if (!Element.isElement(node)) return node;

      let normalized = node;
      if (
        node.type === ElementType.Image &&
        DATA_IMAGE_PATTERN.test(node.url)
      ) {
        const file = await dataUrlToFile(node.url);
        const url = file ? await uploadImage(file) : null;
        if (!url) throw new Error('The embedded image could not be uploaded.');
        normalized = { ...node, url } as Image;
      }

      return {
        ...normalized,
        children: await normalizeInlineImages(normalized.children),
      } as Descendant;
    })
  );
