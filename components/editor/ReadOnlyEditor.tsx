import { ReactNode } from 'react';
import { Descendant, Element as SlateElement } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import { ElementType, FormattedText } from 'types/slate';

type Props = {
  value: Descendant[];
  renderElement: (props: RenderElementProps) => ReactNode;
  renderLeaf: (props: RenderLeafProps) => ReactNode;
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
  renderElement: (props: RenderElementProps) => ReactNode;
  renderLeaf: (props: RenderLeafProps) => ReactNode;
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
  renderElement: (props: RenderElementProps) => ReactNode;
  renderLeaf: (props: RenderLeafProps) => ReactNode;
};

function Element(props: ElementProps) {
  const { element, renderElement, renderLeaf } = props;

  return (
    <>
      {renderElement({
        attributes: { 'data-slate-node': 'element', ref: undefined },
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
  renderLeaf: (props: RenderLeafProps) => ReactNode;
};

function Leaf(props: LeafProps) {
  const { leaf, renderLeaf } = props;

  return (
    <>
      {renderLeaf({
        attributes: { 'data-slate-leaf': true },
        children: <span>{leaf.text}</span>,
        leaf,
        text: leaf,
      })}
    </>
  );
}

const isVoid = (element: SlateElement) => {
  return element.type === ElementType.NoteLink;
};
