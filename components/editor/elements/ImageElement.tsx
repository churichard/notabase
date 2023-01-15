import { ReactNode } from 'react';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import { Image as ImageType } from 'types/slate';

type ImageElementProps = {
  element: ImageType;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

export default function ImageElement(props: ImageElementProps) {
  const { children, attributes, element, className = '' } = props;
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div className={className} {...attributes}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={element.url}
        className={`mx-auto max-h-full max-w-full select-none ${
          selected && focused
            ? 'ring ring-primary-100 dark:ring-primary-900'
            : ''
        }`}
        contentEditable={false}
        alt={element.caption}
      />
      {children}
    </div>
  );
}
