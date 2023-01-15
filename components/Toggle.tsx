import React from 'react';

type Props = {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
  className?: string;
};

export default function Toggle(props: Props) {
  const { className, isChecked, setIsChecked } = props;

  return (
    <div className={`flex flex-col ${className}`}>
      <label
        htmlFor="toggle"
        className="inline-flex cursor-pointer items-center"
      >
        <span className="relative">
          <span
            className={`block h-6 w-10 rounded-full shadow-inner transition-colors ${
              isChecked ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          ></span>
          <span
            className={`focus-within:shadow-outline absolute inset-y-0 left-0 mt-1 ml-1 block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ease-in-out ${
              isChecked ? 'translate-x-full' : null
            }`}
          >
            <input
              id="toggle"
              type="checkbox"
              className="absolute h-0 w-0 opacity-0"
              onClick={() => setIsChecked(!isChecked)}
            />
          </span>
        </span>
      </label>
    </div>
  );
}
