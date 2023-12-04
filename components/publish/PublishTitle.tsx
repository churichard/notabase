import { memo } from 'react';
import { store } from 'lib/store';

type Props = {
  noteId: string;
  className?: string;
};

function PublishTitle(props: Props) {
  const { noteId, className = '' } = props;
  return (
    <div
      className={`title cursor-text border-none p-0 text-3xl font-semibold leading-tight focus:outline-none md:text-4xl ${className}`}
    >
      {store.getState().notes[noteId]?.title}
    </div>
  );
}

export default memo(PublishTitle);
