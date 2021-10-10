import { EditorElementProps } from './EditorElement';

export default function ParagraphElement(props: EditorElementProps) {
  const { className, attributes, children } = props;
  return (
    <div className={className} data-testid="paragraph" {...attributes}>
      {children}
    </div>
  );
}
