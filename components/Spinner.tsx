import React from 'react';
import colors from 'tailwindcss/colors';

export default function Spinner() {
  return (
    <>
      <div className="w-8 h-8 ease-linear border-4 border-t-4 border-gray-100 rounded-full loader animate-spin"></div>
      <style jsx>{`
        .loader {
          border-top-color: ${colors.blue[500]};
          border-right-color: ${colors.blue[500]};
        }
      `}</style>
    </>
  );
}
