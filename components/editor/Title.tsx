import { memo, useEffect, useRef } from 'react';

type Props = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
};

function Title(props: Props) {
  const { className, value, onChange } = props;
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
    titleRef.current.textContent = value;
  }, [value]);

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
        onBlur={emitChange}
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
