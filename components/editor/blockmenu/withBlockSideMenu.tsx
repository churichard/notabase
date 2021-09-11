import { ComponentType } from 'react';
import { isReferenceableBlockElement } from 'editor/checks';
import { EditorElementProps } from '../elements/EditorElement';
import BacklinksPopover from './BacklinksPopover';
import BlockMenuDropdown from './BlockMenuDropdown';

export default function withBlockSideMenu(
  EditorElement: ComponentType<EditorElementProps>
) {
  const ElementWithSideMenu = (props: EditorElementProps) => {
    const { children, className = '', ...otherProps } = props;

    if (!isReferenceableBlockElement(props.element)) {
      return <EditorElement {...props} />;
    }

    return (
      <EditorElement
        className={`relative group before:absolute before:top-0 before:bottom-0 before:w-full before:right-full ${className}`}
        {...otherProps}
      >
        {children}
        <BlockMenuDropdown
          element={props.element}
          /**
           * We're using opacity 0.001 here to support iOS Safari.
           * If we use anything else to hide this element, it would
           * require two taps to edit text (the first tap would display this element).
           */
          className="opacity-0.1 group-hover:opacity-100"
        />
        <BacklinksPopover element={props.element} />
      </EditorElement>
    );
  };

  return ElementWithSideMenu;
}
