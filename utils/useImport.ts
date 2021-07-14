import { useCallback } from 'react';
import unified from 'unified';
import markdown from 'remark-parse';
import { Descendant } from 'slate';
import { toast } from 'react-toastify';
import { store } from 'lib/store';
import upsertNote from 'lib/api/upsertNote';
import remarkToSlate from 'editor/serialization/remarkToSlate';
import { caseInsensitiveStringEqual } from 'utils/string';
import { useAuth } from './useAuth';

export default function useImport() {
  const { user } = useAuth();

  const onImport = useCallback(() => {
    if (!user) {
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.text, .txt, .md, .mkdn, .mdwn, .mdown, .markdown';
    input.multiple = true;

    input.onchange = async (e) => {
      if (!e.target) {
        return;
      }

      const inputElement = e.target as HTMLInputElement;

      if (!inputElement.files) {
        return;
      }

      // Add a new note for each imported note
      const promises = [];
      for (const file of inputElement.files) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        const fileContent = await file.text();

        const { result } = unified()
          .use(markdown)
          .use(remarkToSlate)
          .processSync(fileContent);
        const slateContent = result as Descendant[];

        promises.push(
          upsertNote({
            user_id: user.id,
            title: getUniqueTitle(fileName),
            content: slateContent.length > 0 ? slateContent : undefined,
          })
        );
      }

      const newNotes = await Promise.all(promises);

      // Show a toast with the number of successfully imported notes
      const numOfSuccessfulImports = newNotes.filter((note) => !!note).length;
      if (numOfSuccessfulImports > 1) {
        toast.success(
          `${numOfSuccessfulImports} notes were successfully imported.`
        );
      } else if (numOfSuccessfulImports === 1) {
        toast.success(
          `${numOfSuccessfulImports} note was successfully imported.`
        );
      } else {
        toast.error('No notes were imported.');
      }
    };

    input.click();
  }, [user]);

  return onImport;
}

// Get a unique title by appending a number after the given noteTitle.
const getUniqueTitle = (title: string) => {
  const getResult = () => (suffix > 0 ? `${title} ${suffix}` : title);

  let suffix = 0;
  const notesArr = Object.values(store.getState().notes);
  while (
    notesArr.findIndex((note) =>
      caseInsensitiveStringEqual(note.title, getResult())
    ) > -1
  ) {
    suffix += 1;
  }

  return getResult();
};
