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
            className="absolute flex items-center select-none justify-center w-6 h-6 text-sm font-medium rounded text-primary-700 top-0.5 -right-8 hover:bg-gray-100 active:bg-gray-200 dark:text-primary-400 dark:hover:bg-gray-800 dark:active:bg-gray-700 focus:outline-none"
            contentEditable={false}
          >
            {numOfMatches}
          </Popover.Button>
          {open && (
            <Portal>
              <Popover.Panel
                className={`z-10 p-2 overflow-y-auto bg-white rounded shadow-popover w-64 md:w-96 lg:w-128 max-h-128 dark:bg-gray-800 ${
                  state?.modifiersData.hide?.isReferenceHidden
                    ? 'invisible pointer-events-none'
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
