import { ReactNode } from 'react';
import { Descendant, Element as SlateElement } from 'slate';
import { isVoid } from 'editor/plugins/withVoidElements';
import { FormattedText } from 'types/slate';
import { EditorElementProps } from './elements/EditorElement';
import { EditorLeafProps } from './elements/EditorLeaf';

type Props = {
  value: Descendant[];
  renderElement: (props: EditorElementProps) => ReactNode;
  renderLeaf: (props: EditorLeafProps) => ReactNode;
};

export function ReadOnlyEditor(props: Props) {
  const { value, renderElement, renderLeaf } = props;
  return (
    <Children
      value={value}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
    />
  );
}

type ChildrenProps = {
  value: Descendant[];
  renderElement: (props: EditorElementProps) => ReactNode;
  renderLeaf: (props: EditorLeafProps) => ReactNode;
};

const Children = (props: ChildrenProps) => {
  const { value, renderElement, renderLeaf } = props;
  return (
    <>
      {value.map((child, i) => {
        if (SlateElement.isElement(child)) {
          return (
            <Element
              key={i}
              element={child}
              renderElement={renderElement}
              renderLeaf={!isVoid(child) ? renderLeaf : () => null}
            />
          );
        } else {
          return <Leaf key={i} leaf={child} renderLeaf={renderLeaf} />;
        }
      })}
    </>
  );
};

type ElementProps = {
  element: SlateElement;
  renderElement: (props: EditorElementProps) => ReactNode;
  renderLeaf: (props: EditorLeafProps) => ReactNode;
};

function Element(props: ElementProps) {
  const { element, renderElement, renderLeaf } = props;

  return (
    <>
      {renderElement({
        className: 'pointer-events-none',
        attributes: {
          'data-slate-node': 'element',
          ref: undefined,
          contentEditable: false,
        },
        children: (
          <Children
            value={element.children}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
          />
        ),
        element,
      })}
    </>
  );
}

type LeafProps = {
  leaf: FormattedText;
  renderLeaf: (props: EditorLeafProps) => ReactNode;
};

function Leaf(props: LeafProps) {
  const { leaf, renderLeaf } = props;

  return (
    <>
      {renderLeaf({
        attributes: { 'data-slate-leaf': true, contentEditable: false },
        children: <span>{leaf.text}</span>,
        leaf,
        text: leaf,
      })}
    </>
  );
}
