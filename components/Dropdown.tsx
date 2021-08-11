import { useRef, useState, ReactNode } from 'react';
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

  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(buttonRef.current, popperElement, {
    placement,
    modifiers: [{ name: 'offset', options: { offset } }],
  });

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button className={buttonClassName}>
            <Tooltip
              disabled={!tooltipContent}
              content={tooltipContent}
              delay={[200, 0]}
              placement={tooltipPlacement}
            >
              <span ref={buttonRef}>{buttonChildren}</span>
            </Tooltip>
          </Menu.Button>
          {open && (
            <Portal>
              <Menu.Items
                ref={setPopperElement}
                className={`z-10 w-48 overflow-hidden text-sm bg-white rounded shadow-popover ${itemsClassName}`}
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
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

export function DropdownItem(props: DropdownItemProps) {
  const { onClick, children, className = '' } = props;
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={`flex w-full items-center px-4 py-2 text-left text-gray-800 ${
            active ? 'bg-gray-100' : ''
          } ${className}`}
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}
