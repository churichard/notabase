import { memo } from 'react';

type Props = {
  title: string;
  className?: string;
};

function PublishTitle(props: Props) {
  const { title, className = '' } = props;

  return (
    <div
      className={`title cursor-text border-none p-0 text-3xl font-semibold leading-tight focus:outline-none md:text-4xl ${className}`}
    >
      {title}
    </div>
  );
}

export default memo(PublishTitle);
