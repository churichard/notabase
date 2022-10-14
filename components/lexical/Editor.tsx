import { TRANSFORMERS } from '@lexical/markdown';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import EditorTheme from './theme/EditorTheme';
import EditorNodes from './nodes/EditorNodes';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import HoveringToolbarPlugin from './plugins/HoveringToolbarPlugin';
import HoveringLinkEditorPlugin from './plugins/HoveringLinkEditorPlugin';

const initialConfig = {
  namespace: 'NotabaseEditor',
  nodes: [...EditorNodes],
  theme: EditorTheme,
  onError,
};

type Props = { className?: string };

export default function Editor(props: Props) {
  const { className } = props;

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={`overflow-hidden placeholder-gray-300 ${className}`}
          />
        }
        placeholder=""
      />
      <HistoryPlugin />
      <LinkPlugin />
      <AutoLinkPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <HoveringToolbarPlugin />
      <HoveringLinkEditorPlugin />
    </LexicalComposer>
  );
}

function onError(error: Error) {
  console.error(error);
}
