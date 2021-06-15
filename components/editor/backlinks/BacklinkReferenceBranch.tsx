import { memo } from 'react';

type BacklinkReferenceBranchProps = {
  title: string;
};

const BacklinkReferenceBranch = (props: BacklinkReferenceBranchProps) => {
  const { title } = props;
  return <p className="text-gray-800">{title}</p>;
};

export default memo(BacklinkReferenceBranch);
