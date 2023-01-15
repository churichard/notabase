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
      <div className="group relative w-full before:absolute before:top-0 before:bottom-0 before:right-full before:w-full">
        <EditorElement {...props} />
        <BlockMenuDropdown
          element={element}
          /**
           * We're using opacity 0.001 here to support iOS Safari.
           * If we use anything else to hide this element, it would
           * require two taps to edit text (the first tap would display this element).
           */
          className="opacity-0.1 group-hover:opacity-100"
        />
        <BacklinksPopover element={element} />
      </div>
    );
  };

  return ElementWithSideMenu;
}
