import {
  useState,
  ReactNode,
  MouseEventHandler,
  useRef,
  useCallback,
} from 'react';
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

type DropdownItemProps =
  | {
      children: ReactNode;
      onClick: MouseEventHandler<HTMLButtonElement>;
      as?: 'button';
      className?: string;
    }
  | {
      children: ReactNode;
      href: string;
      as: 'a';
      className?: string;
    };

export function DropdownItem(props: DropdownItemProps) {
  const { children, className = '' } = props;

  const itemClassName = useCallback(
    (active) =>
      `flex w-full items-center px-4 py-2 text-left text-sm text-gray-800 dark:text-gray-200 select-none ${
        active ? 'bg-gray-100 dark:bg-gray-700' : ''
      } ${className}`,
    [className]
  );

  return (
    <Menu.Item>
      {({ active }) =>
        props.as === 'a' ? (
          <a
            className={itemClassName(active)}
            href={props.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ) : (
          <button className={itemClassName(active)} onClick={props.onClick}>
            {children}
          </button>
        )
      }
    </Menu.Item>
  );
}
