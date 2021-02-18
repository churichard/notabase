import React, { useEffect, useMemo, useRef } from 'react';
import { useSlate, ReactEditor } from 'slate-react';
import { Editor, Range } from 'slate';
import { Bold, Italic, Underline, Code } from 'react-feather';
import Portal from 'components/Portal';
import { toggleMark, isMarkActive } from './Editor';

export default function HoveringToolbar() {
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.style.opacity = '0';
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection) {
      return;
    }
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${rect.left + window.pageXOffset}px`;
  });

  return (
    <Portal selector="#hovering-toolbar">
      <div
        ref={ref}
        className="absolute z-10 flex items-center -mt-2 overflow-hidden transition-opacity bg-white border rounded-md opacity-0 toolbar -top-16 -left-16"
      >
        <FormatButton format="bold" />
        <FormatButton format="italic" />
        <FormatButton format="underline" />
        <FormatButton format="code" />
        <style jsx>{`
          .toolbar {
            box-shadow: rgb(15 15 15 / 10%) 0px 3px 6px,
              rgb(15 15 15 / 20%) 0px 9px 24px;
          }
        `}</style>
      </div>
    </Portal>
  );
}

type FormatButtonProps = {
  format: 'bold' | 'italic' | 'underline' | 'code';
};

const FormatButton = ({ format }: FormatButtonProps) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  const Icon = useMemo(() => {
    if (format === 'bold') {
      return Bold;
    } else if (format === 'italic') {
      return Italic;
    } else if (format === 'underline') {
      return Underline;
    } else if (format === 'code') {
      return Code;
    } else {
      throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  return (
    <span
      className="px-1 py-2 cursor-pointer hover:bg-gray-100"
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={(event) => {
        if (event.button === 0) {
          event.preventDefault();
          toggleMark(editor, format);
        }
      }}
    >
      <Icon
        className={`${isActive ? 'text-primary-500' : 'text-gray-700'}`}
        size={18}
      />
    </span>
  );
};
