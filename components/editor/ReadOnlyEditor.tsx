import React, { ReactNode } from 'react';
import { Descendant, Element as SlateElement } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import { FormattedText } from 'types/slate';

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
              renderLeaf={renderLeaf}
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
    <React.Fragment>
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
    </React.Fragment>
  );
}

type LeafProps = {
  leaf: FormattedText;
  renderLeaf: (props: RenderLeafProps) => ReactNode;
};

function Leaf(props: LeafProps) {
  const { leaf, renderLeaf } = props;

  return (
    <React.Fragment>
      {renderLeaf({
        attributes: { 'data-slate-leaf': true },
        children: <span>{leaf.text}</span>,
        leaf,
        text: leaf,
      })}
    </React.Fragment>
  );
}
