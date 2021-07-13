import normalizeLists from './normalizeLists';
import deserialize, { OptionType } from './deserialize';
import { MdastNode } from './types';

export default function remarkToSlate(opts?: OptionType) {
  const compiler = (node: { children: Array<MdastNode> }) => {
    return node.children
      .map((c) => normalizeLists(c))
      .map((c) => deserialize(c, opts));
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  this.Compiler = compiler;
}
