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
          className="hidden group-hover:block"
        />
        <BacklinksPopover element={props.element} />
      </EditorElement>
    );
  };

  return ElementWithSideMenu;
}
