import { ComponentType } from 'react';
import { useSlateStatic } from 'slate-react';
import { IconDotsVertical } from '@tabler/icons';
import { ElementType } from 'types/slate';
import Tooltip from 'components/Tooltip';
import { EditorElementProps } from './EditorElement';

export const withOptionsMenu = (
  EditorElement: ComponentType<EditorElementProps>
) => {
  function WithOptionsMenuComponent(props: EditorElementProps) {
    const { children, className, ...otherProps } = props;
    const editor = useSlateStatic();
    const elementType = props.element.type;

    // We don't show the options menu for inline elements or bulleted/numbered lists
    if (
      editor.isInline(props.element) ||
      elementType === ElementType.BulletedList ||
      elementType === ElementType.NumberedList
    ) {
      return <EditorElement {...props} />;
    }

    const getButtonPosition = () => {
      if (elementType === ElementType.ListItem) {
        return '-left-14';
      } else if (elementType === ElementType.Blockquote) {
        return '-left-7';
      } else {
        return '-left-6';
      }
    };

    return (
      <EditorElement
        className={`relative w-full group before:absolute before:top-0 before:bottom-0 before:w-full before:right-full ${className}`}
        {...otherProps}
      >
        {children}
        <Tooltip
          content={<span className="text-xs">Click to open menu</span>}
          delay={[200, 0]}
        >
          <button
            className={`hidden group-hover:block hover:bg-gray-200 rounded p-0.5 absolute top-0.5 ${getButtonPosition()}`}
          >
            <IconDotsVertical className="text-gray-500" size={18} />
          </button>
        </Tooltip>
      </EditorElement>
    );
  }

  return WithOptionsMenuComponent;
};
