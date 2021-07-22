import Tippy, { TippyProps } from '@tippyjs/react';

type TooltipProps = TippyProps;

export default function Tooltip(props: TooltipProps) {
  const {
    children,
    duration = 0,
    arrow = false,
    offset = [0, 6],
    touch = ['hold', 500],
    ...otherProps
  } = props;

  return (
    <Tippy
      duration={duration}
      arrow={arrow}
      offset={offset}
      touch={touch}
      {...otherProps}
    >
      {children}
    </Tippy>
  );
}
