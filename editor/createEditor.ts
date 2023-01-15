import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { createEditor } from 'slate';
import withAutoMarkdown from 'editor/plugins/withAutoMarkdown';
import withBlockBreakout from 'editor/plugins/withBlockBreakout';
import withLinks from 'editor/plugins/withLinks';
import withNormalization from 'editor/plugins/withNormalization';
import withCustomDeleteBackward from 'editor/plugins/withCustomDeleteBackward';
import withImages from 'editor/plugins/withImages';
import withVoidElements from 'editor/plugins/withVoidElements';
import withNodeId from 'editor/plugins/withNodeId';
import withBlockReferences from 'editor/plugins/withBlockReferences';
import withTags from 'editor/plugins/withTags';
import withHtml from 'editor/plugins/withHtml';

const createNotabaseEditor = () =>
  withNormalization(
    withCustomDeleteBackward(
      withAutoMarkdown(
        withHtml(
          withBlockBreakout(
            withVoidElements(
              withBlockReferences(
                withImages(
                  withTags(
                    withLinks(
                      withNodeId(withHistory(withReact(createEditor())))
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );

export default createNotabaseEditor;
