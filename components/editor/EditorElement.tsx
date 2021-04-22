import React, { createRef, ReactNode, useCallback } from 'react';
import { RenderElementProps } from 'slate-react';
import Tippy from '@tippyjs/react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { ElementType, ExternalLink, NoteLink } from 'types/slate';
import { openNotesAtom } from 'editor/state';
import { useAuth } from 'utils/useAuth';
import getOrAddNote from 'lib/api/getOrAddNote';
import { useCurrentNote } from 'utils/useCurrentNote';

export default function EditorElement({
  attributes,
  children,
  element,
}: RenderElementProps) {
  switch (element.type) {
    case ElementType.HeadingOne:
      return (
        <h1 className="my-3 text-2xl font-semibold" {...attributes}>
          {children}
        </h1>
      );
    case ElementType.HeadingTwo:
      return (
        <h2 className="my-3 text-xl font-semibold" {...attributes}>
          {children}
        </h2>
      );
    case ElementType.HeadingThree:
      return (
        <h3 className="my-3 text-lg font-semibold" {...attributes}>
          {children}
        </h3>
      );
    case ElementType.ListItem:
      return (
        <li className="pl-1 my-2" {...attributes}>
          {children}
        </li>
      );
    case ElementType.BulletedList:
      return (
        <ul className="my-3 ml-8 list-disc" {...attributes}>
          {children}
        </ul>
      );
    case ElementType.NumberedList:
      return (
        <ol className="my-3 ml-8 list-decimal" {...attributes}>
          {children}
        </ol>
      );
    case ElementType.Blockquote:
      return (
        <blockquote className="pl-4 my-3 border-l-4" {...attributes}>
          {children}
        </blockquote>
      );
    case ElementType.ExternalLink:
      return (
        <ExternalLinkElement element={element} attributes={attributes}>
          {children}
        </ExternalLinkElement>
      );
    case ElementType.NoteLink:
      return (
        <NoteLinkElement element={element} attributes={attributes}>
          {children}
        </NoteLinkElement>
      );
    default:
      return (
        <p className="my-3" {...attributes}>
          {children}
        </p>
      );
  }
}

type NoteLinkElementProps = {
  element: NoteLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
};

const NoteLinkElement = (props: NoteLinkElementProps) => {
  const { element, children, attributes } = props;
  const { user } = useAuth();
  const router = useRouter();
  const currentNote = useCurrentNote();
  const [openNotes, setOpenNotes] = useAtom(openNotesAtom);

  const onClick = useCallback(async () => {
    const scrollOptions: ScrollIntoViewOptions = {
      behavior: 'smooth',
      inline: 'center',
    };

    // If the note is already open, scroll it into view
    const openNote = openNotes.find(({ note }) => note.id === element.noteId);
    if (openNote) {
      openNote.ref.current?.scrollIntoView(scrollOptions);
      return;
    }

    // If the note is not open: fetch it, add it to the open notes, and scroll it into view
    const currentNoteIndex = openNotes.findIndex(
      ({ note }) => note.id === currentNote.id
    );
    if (currentNoteIndex < 0 || !user) {
      return;
    }

    const newStackedNote = await getOrAddNote(user.id, element.noteTitle);
    if (newStackedNote) {
      // Update stack query param shallowly
      const stackedNoteIds: string[] = [];
      const stackQuery = router.query.stack;
      if (stackQuery) {
        if (typeof stackQuery === 'string') {
          stackedNoteIds.push(stackQuery);
        } else {
          stackedNoteIds.push(...stackQuery);
        }
      }
      // Replace the notes after the current note with the new note
      stackedNoteIds.splice(
        currentNoteIndex, // Stacked notes don't include the current note
        stackedNoteIds.length - currentNoteIndex,
        newStackedNote.id
      );
      // Push stack query param into router
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, stack: stackedNoteIds },
        },
        undefined,
        { shallow: true }
      );

      // Add note to open notes and scroll it into view
      const ref = createRef<HTMLElement | null>();
      await setOpenNotes((notes) => {
        const newNotes = [...notes];
        // Replace the notes after the current note with the new note
        newNotes.splice(currentNoteIndex + 1, notes.length - currentNoteIndex, {
          note: newStackedNote,
          ref,
        });
        return newNotes;
      });
      ref.current?.scrollIntoView(scrollOptions);
    }
  }, [
    user,
    router,
    element.noteTitle,
    element.noteId,
    currentNote.id,
    openNotes,
    setOpenNotes,
  ]);

  return (
    <Tippy content={element.noteTitle} duration={0} placement="bottom">
      <button
        className="underline cursor-pointer text-primary-500"
        onClick={onClick}
        {...attributes}
      >
        {children}
      </button>
    </Tippy>
  );
};

type ExternalLinkElementProps = {
  element: ExternalLink;
  children: ReactNode;
  attributes: RenderElementProps['attributes'];
};

const ExternalLinkElement = (props: ExternalLinkElementProps) => {
  const { element, children, attributes } = props;
  return (
    <Tippy content={element.url} duration={0} placement="bottom">
      <a
        className="underline cursor-pointer text-primary-500"
        href={element.url}
        onClick={() =>
          window.open(element.url, '_blank', 'noopener noreferrer')
        }
        {...attributes}
      >
        {children}
      </a>
    </Tippy>
  );
};
