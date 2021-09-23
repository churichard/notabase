import { useState, ReactNode, MouseEventHandler, useRef } from 'react';
import { usePopper } from 'react-popper';
import { Menu } from '@headlessui/react';
import { Placement } from '@popperjs/core';
import Portal from './Portal';
import Tooltip from './Tooltip';

type Props = {
  buttonChildren: ReactNode;
  children: ReactNode;
  buttonClassName?: string;
  itemsClassName?: string;
  placement?: Placement;
  offset?: [number | null | undefined, number | null | undefined];
  tooltipContent?: ReactNode;
  tooltipPlacement?: Placement;
};

export default function Dropdown(props: Props) {
  const {
    buttonChildren,
    children,
    buttonClassName = '',
    itemsClassName = '',
    placement,
    offset,
    tooltipContent,
    tooltipPlacement,
  } = props;

  const referenceElementRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    referenceElementRef.current,
    popperElement,
    {
      placement,
      modifiers: [{ name: 'offset', options: { offset } }],
    }
  );

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            ref={referenceElementRef}
            className={buttonClassName}
            contentEditable={false}
          >
            <Tooltip
              disabled={!tooltipContent}
              content={tooltipContent}
              delay={[200, 0]}
              placement={tooltipPlacement}
            >
              <span>{buttonChildren}</span>
            </Tooltip>
          </Menu.Button>
          {open && (
            <Portal>
              <Menu.Items
                ref={setPopperElement}
                className={`z-20 w-52 overflow-hidden text-sm bg-white rounded shadow-popover dark:bg-gray-800 focus:outline-none ${itemsClassName}`}
                static
                style={styles.popper}
                {...attributes.popper}
              >
                {children}
              </Menu.Items>
            </Portal>
          )}
        </>
      )}
    </Menu>
  );
}

type DropdownItemProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
};

export function DropdownItem(props: DropdownItemProps) {
  const { onClick, children, className = '' } = props;
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={`flex w-full items-center px-4 py-2 text-left text-sm text-gray-800 dark:text-gray-200 select-none ${
            active ? 'bg-gray-100 dark:bg-gray-700' : ''
          } ${className}`}
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}
