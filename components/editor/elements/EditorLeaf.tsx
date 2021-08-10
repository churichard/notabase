import { RenderLeafProps } from 'slate-react';

export type EditorLeafProps = RenderLeafProps;

const EditorLeaf = ({ attributes, children, leaf }: EditorLeafProps) => {
  if (leaf.bold) {
    children = <span className="font-semibold">{children}</span>;
  }

  if (leaf.code) {
    children = (
      <code className="p-0.25 bg-gray-100 border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-700">
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
