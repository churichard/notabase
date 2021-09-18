import { ReactNode } from 'react';
import { RenderElementProps } from 'slate-react';
import classNames from 'classnames';
import { ExternalLink } from 'types/slate';
import Tooltip from 'components/Tooltip';

type ExternalLinkElementProps = {
  element: ExternalLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
  className?: string;
};

export default function ExternalLinkElement(props: ExternalLinkElementProps) {
  const { element, children, attributes, className } = props;
  const linkClassName = classNames('link hover:underline', className);
  return (
    <Tooltip
      content={<span className="break-words">{element.url}</span>}
      placement="bottom-start"
    >
      <a
        className={linkClassName}
        href={element.url}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(element.url, '_blank', 'noopener noreferrer');
        }}
        {...attributes}
      >
        {children}
      </a>
    </Tooltip>
  );
}
