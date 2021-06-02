import React from 'react';

type Props = {
  className?: string;
};

export default function Footer(props: Props) {
  const { className } = props;
  return (
    <div className={`py-8 bg-gray-50 md:py-16 ${className}`}>
      <div className="container flex flex-col justify-between px-6 lg:flex-row">
        <div>
          <p className="font-medium">Notabase</p>
          <p className="text-gray-700">
            A personal knowledge base for networked thinking.
          </p>
          <p className="text-gray-700">Currently in alpha.</p>
        </div>
        <div className="flex flex-wrap flex-1 lg:justify-end">
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-medium">Connect</p>
            <a
              href="mailto:hello@notabase.io"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact
            </a>
            <a
              href="https://github.com/churichard/notabase"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://github.com/churichard/notabase/discussions"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Forum
            </a>
            <a
              href="https://twitter.com/notabase"
              className="text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
