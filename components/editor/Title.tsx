import { memo, useEffect, useRef } from 'react';
import { store } from 'lib/store';

type Props = {
  noteId: string;
  onChange: (value: string) => void;
  className?: string;
};

function Title(props: Props) {
  const { noteId, onChange, className = '' } = props;
  const titleRef = useRef<HTMLDivElement | null>(null);

  const emitChange = () => {
    if (!titleRef.current) {
      return;
    }
    const title = titleRef.current.textContent ?? '';
    onChange(title);
  };

  // Set the initial title
  useEffect(() => {
    if (!titleRef.current || titleRef.current.textContent) {
      return;
    }
    const initialValue = store.getState().notes[noteId]?.title ?? '';
    titleRef.current.textContent = initialValue;
  }, [noteId]);

  return (
    <>
      <div
        ref={titleRef}
        className={`title text-3xl md:text-4xl font-semibold border-none focus:outline-none p-0 leading-tight cursor-text ${className}`}
        role="textbox"
        placeholder="Untitled"
        onKeyPress={(event) => {
          // Disallow newlines in the title field
          if (event.key === 'Enter') {
            event.preventDefault();
          }
        }}
        onPaste={(event) => {
          // Remove styling and newlines from the text
          event.preventDefault();
          let text = event.clipboardData.getData('text/plain');
          text = text.replace(/\r?\n|\r/g, ' ');
          document.execCommand('insertText', false, text);
        }}
        onInput={emitChange}
        contentEditable
        spellCheck
      />
      <style jsx>{`
        .title[placeholder]:empty:before {
          content: attr(placeholder);
          color: #d1d5db;
        }
      `}</style>
    </>
  );
}

export default memo(Title);
