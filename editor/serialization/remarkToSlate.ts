import { getDefaultEditorValue } from 'editor/constants';
import normalize from './normalize';
import deserialize, { OptionType } from './deserialize';
import { MdastNode } from './types';

export default function remarkToSlate(opts?: OptionType) {
  const compiler = (node: { children: Array<MdastNode> }) => {
    // Normalize to conform to Notabase's slate schema
    const normalizedNode = normalize(node);

    if (!normalizedNode.children) {
      return getDefaultEditorValue();
    }

    // Deserialize MdastNode into slate document
    const slateContent = normalizedNode.children.map((c) =>
      deserialize(c, opts)
    );

    return slateContent;
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  this.Compiler = compiler;
}
