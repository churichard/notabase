import React from 'react';

export default function Spinner() {
  return (
    <div className="w-8 h-8 ease-linear border-4 border-t-4 border-gray-100 rounded-full animate-spin">
      <style jsx>{`
        & {
          border-top-color: var(--color-primary-500);
          border-right-color: var(--color-primary-500);
        }
      `}</style>
    </div>
  );
}
