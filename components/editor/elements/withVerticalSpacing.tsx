import { ComponentType } from 'react';
import { useSlateStatic } from 'slate-react';
import { ElementType } from 'types/slate';
import { EditorElementProps } from './EditorElement';

export const withVerticalSpacing = (
  EditorElement: ComponentType<EditorElementProps>
) => {
  function WithOptionsMenuComponent(props: EditorElementProps) {
    const { children, className, ...otherProps } = props;
    const editor = useSlateStatic();
    const elementType = props.element.type;

    // No vertical spacing for inline elements
    if (editor.isInline(props.element)) {
      return <EditorElement {...props} />;
    }

    const getVerticalSpacing = () => {
      if (
        elementType === ElementType.ListItem ||
        elementType === ElementType.BulletedList ||
        elementType === ElementType.NumberedList
      ) {
        return 'my-2';
      } else if (elementType === ElementType.HeadingOne) {
        return 'mb-3 mt-8 first:mt-3';
      } else if (elementType === ElementType.HeadingTwo) {
        return 'mb-3 mt-6 first:mt-3';
      } else if (elementType === ElementType.HeadingThree) {
        return 'mb-3 mt-4 first:mt-3';
      } else {
        return 'my-3';
      }
    };

    return (
      <EditorElement
        className={`${getVerticalSpacing()} ${className}`}
        {...otherProps}
      >
        {children}
      </EditorElement>
    );
  }

  return WithOptionsMenuComponent;
};
