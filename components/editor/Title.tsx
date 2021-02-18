import React from 'react';

type Props = {
  className?: string;
};

export default function Title(props: Props) {
  const { className } = props;

  return (
    <>
      <div
        className={`title text-3xl font-semibold border-none focus:outline-none p-0 leading-10 cursor-text ${className}`}
        role="textbox"
        placeholder="Untitled"
        spellCheck={false}
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
        contentEditable
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
