import { ComponentType } from 'react';
import { isReferenceableBlockElement } from 'editor/checks';
import { EditorElementProps } from '../elements/EditorElement';
import BacklinksPopover from './BacklinksPopover';
import BlockMenuDropdown from './BlockMenuDropdown';

export default function withBlockSideMenu(
  EditorElement: ComponentType<EditorElementProps>
) {
  const ElementWithSideMenu = (props: EditorElementProps) => {
    const { element } = props;

    if (!isReferenceableBlockElement(element)) {
      return <EditorElement {...props} />;
    }

    return (
      <div className="relative w-full group before:absolute before:top-0 before:bottom-0 before:w-full before:right-full">
        <EditorElement {...props} />
        <BlockMenuDropdown element={element} />
        <BacklinksPopover element={element} />
      </div>
    );
  };

  return ElementWithSideMenu;
}
