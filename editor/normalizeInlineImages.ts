import { Element, type Descendant } from 'slate';
import { ElementType, type Image } from 'types/slate';
import { store } from 'lib/store';
import { PlanId } from 'constants/pricing';
import { uploadImage } from './plugins/withImages';

const DATA_IMAGE_PATTERN = /^data:(image\/[a-z0-9.+-]+);base64,/i;

const dataUrlToFile = async (url: string) => {
  const match = url.match(DATA_IMAGE_PATTERN);
  if (!match) return null;
  const blob = await fetch(url).then((response) => response.blob());
  const extension = match[1].split('/')[1] || 'png';
  return new File([blob], `pasted-image.${extension}`, { type: match[1] });
};

export type NormalizedInlineImages = {
  content: Descendant[];
  numOfStrippedImages: number;
};

export const normalizeInlineImages = async (
  nodes: Descendant[]
): Promise<NormalizedInlineImages> => {
  let numOfStrippedImages = 0;

  const normalizeNodes = async (nodes: Descendant[]): Promise<Descendant[]> => {
    const normalizedNodes = await Promise.all(
      nodes.map(async (node): Promise<Descendant | null> => {
        if (!Element.isElement(node)) return node;

        let normalized = node;
        if (
          node.type === ElementType.Image &&
          DATA_IMAGE_PATTERN.test(node.url)
        ) {
          // Users on the basic plan cannot upload images, so strip embedded
          // images instead of failing the whole paste or import
          if (store.getState().billingDetails.planId === PlanId.Basic) {
            numOfStrippedImages++;
            return null;
          }
          const file = await dataUrlToFile(node.url);
          const url = file ? await uploadImage(file) : null;
          if (!url)
            throw new Error('The embedded image could not be uploaded.');
          normalized = { ...node, url } as Image;
        }

        const children = await normalizeNodes(normalized.children);
        return {
          ...normalized,
          // Slate elements must have at least one child
          children: children.length > 0 ? children : [{ text: '' }],
        } as Descendant;
      })
    );

    return normalizedNodes.filter((node): node is Descendant => node !== null);
  };

  return {
    content: await normalizeNodes(nodes),
    numOfStrippedImages,
  };
};
