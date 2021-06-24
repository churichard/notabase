import { RenderLeafProps } from 'slate-react';

const EditorLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <span className="font-semibold">{children}</span>;
  }

  if (leaf.code) {
    children = (
      <code className="p-1 bg-gray-100 border border-gray-200 rounded">
        {children}
      </code>
    );
  }

  if (leaf.italic) {
    children = <em className="italic">{children}</em>;
  }

  if (leaf.underline) {
    children = <u className="underline">{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s className="line-through">{children}</s>;
  }

  return <span {...attributes}>{children}</span>;
};

export default EditorLeaf;
