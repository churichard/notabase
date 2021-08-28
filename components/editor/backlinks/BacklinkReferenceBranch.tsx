import { memo } from 'react';

type BacklinkReferenceBranchProps = {
  title: string;
};

const BacklinkReferenceBranch = (props: BacklinkReferenceBranchProps) => {
  const { title } = props;
  return <p className="py-1 text-gray-800 dark:text-gray-100">{title}</p>;
};

export default memo(BacklinkReferenceBranch);
