import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  Fragment,
} from 'react';
import { Node } from 'slate';
import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';
import { ReferenceableBlockElement } from 'types/slate';
import Portal from 'components/Portal';
import updateBlockBacklinks from 'editor/backlinks/updateBlockBacklinks';
import { shallow, Store, useStore } from 'lib/store';
import BlockBacklinks from '../backlinks/BlockBacklinks';
import { getNumOfMatches } from '../backlinks/Backlinks';

const UPDATE_BLOCK_BACKLINKS_DEBOUNCE_MS = 500;

type BacklinksPopoverProps = {
  element: ReferenceableBlockElement;
};

export default function BacklinksPopover(props: BacklinksPopoverProps) {
  const { element } = props;

  const referenceElementRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes, state } = usePopper(
    referenceElementRef.current,
    popperElement,
    {
      placement: 'bottom-end',
      modifiers: [{ name: 'offset', options: { offset: [0, 6] } }],
    }
  );

  const blockBacklinksSelector = useCallback(
    (state: Store) => state.blockIdToBacklinksMap[element.id] ?? [],
    [element.id]
  );
  const blockBacklinks = useStore(blockBacklinksSelector, shallow);
  const numOfMatches = useMemo(
    () => getNumOfMatches(blockBacklinks),
    [blockBacklinks]
  );

  // Update block references with the proper text when the block has changed
  const currentElementText = useMemo(() => Node.string(element), [element]);
  const prevSavedElementText = useRef<string>(currentElementText);
  useEffect(() => {
    // Only update if it is not the first render, there are backlinks, and the element text has updated
    if (
      numOfMatches > 0 &&
      prevSavedElementText.current !== currentElementText
    ) {
      const handler = setTimeout(() => {
        updateBlockBacklinks(blockBacklinks, currentElementText);
        prevSavedElementText.current = currentElementText;
      }, UPDATE_BLOCK_BACKLINKS_DEBOUNCE_MS);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [numOfMatches, currentElementText, blockBacklinks]);

  return numOfMatches > 0 ? (
    <Popover as={Fragment}>
      {({ open }) => (
        <>
          <Popover.Button
            ref={referenceElementRef}
            className="absolute top-0.5 -right-8 flex h-6 w-6 select-none items-center justify-center rounded text-sm font-medium text-primary-700 hover:bg-gray-100 focus:outline-none active:bg-gray-200 dark:text-primary-400 dark:hover:bg-gray-800 dark:active:bg-gray-700"
            contentEditable={false}
          >
            {numOfMatches}
          </Popover.Button>
          {open && (
            <Portal>
              <Popover.Panel
                className={`z-10 max-h-128 w-64 overflow-y-auto rounded bg-white p-2 shadow-popover dark:bg-gray-800 md:w-96 lg:w-128 ${
                  state?.modifiersData.hide?.isReferenceHidden
                    ? 'pointer-events-none invisible'
                    : ''
                }`}
                contentEditable={false}
                static
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
              >
                <BlockBacklinks backlinks={blockBacklinks} />
              </Popover.Panel>
            </Portal>
          )}
        </>
      )}
    </Popover>
  ) : null;
}
