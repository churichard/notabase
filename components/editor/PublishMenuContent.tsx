import { useCallback, useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconArrowUpCircle,
  IconCircleCheck,
} from '@tabler/icons';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import updateNote from 'lib/api/updateNote';
import { Note, Visibility } from 'types/supabase';
import { NoteTreeItem, store, useStore } from 'lib/store';
import { useAuth } from 'utils/useAuth';
import Tooltip from 'components/Tooltip';
import supabase from 'lib/supabase';
import Spinner from 'components/Spinner';

type Props = {
  hasPublishingFeature: boolean;
  noteId: string;
  isNotePrivate: boolean;
};

export default function PublishMenuContent(props: Props) {
  const { hasPublishingFeature, noteId, isNotePrivate } = props;
  const { user } = useAuth();
  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
  );

  const [isNestedNotesInputChecked, setIsNestedNotesInputChecked] =
    useState<boolean>(false);

  const onPublishClick = useCallback(async () => {
    if (hasPublishingFeature) {
      if (isNestedNotesInputChecked) {
        const noteTreeItem = store
          .getState()
          .noteTree.find((note) => note.id === noteId);
        if (noteTreeItem) {
          await publishNestedNotes(noteTreeItem);
        }
      } else {
        await updateNote({ id: noteId, visibility: Visibility.Public });
      }
    } else {
      setIsUpgradeModalOpen(true);
    }
  }, [
    noteId,
    hasPublishingFeature,
    setIsUpgradeModalOpen,
    isNestedNotesInputChecked,
  ]);

  const onUnpublishClick = useCallback(async () => {
    await updateNote({ id: noteId, visibility: Visibility.Private });
  }, [noteId]);

  const [siteId, setSiteId] = useState<string | null>(null);
  useEffect(() => {
    const fetchSiteId = async (userId: string) => {
      const { data } = await supabase
        .from('sites')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setSiteId(data.id);
      }
    };
    if (user?.id) {
      fetchSiteId(user.id);
    }
  }, [user?.id]);

  const publicUrl = `${window.location.protocol}//${window.location.host}/publish/${siteId}/note/${noteId}`;

  if (hasPublishingFeature && !isNotePrivate && siteId === null) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isNotePrivate) {
    return (
      <div className="dark:text-white">
        <h1 className="text-center text-lg font-medium">Publish to the web</h1>
        <p className="mt-4">
          Publish a read-only version of this note to the web. It will be
          publicly accessible by anyone with the link.
        </p>
        <span className="mt-4 flex items-center">
          <input
            id="nestedNotesInput"
            type="checkbox"
            checked={isNestedNotesInputChecked}
            onChange={(e) => setIsNestedNotesInputChecked(e.target.checked)}
            className="mr-2 rounded text-primary-500"
          />
          <label htmlFor="nestedNotesInput">Include all nested notes</label>
        </span>
        <Tooltip
          content="Get Notabase Pro to publish your notes on the web."
          disabled={hasPublishingFeature}
        >
          <button
            className="btn mt-4 flex w-full items-center justify-center px-4 py-2"
            onClick={onPublishClick}
          >
            {!hasPublishingFeature && (
              <IconArrowUpCircle size={18} className="mr-1 flex-shrink-0" />
            )}
            {!hasPublishingFeature ? 'Upgrade to publish' : 'Publish to web'}
          </button>
        </Tooltip>
      </div>
    );
  } else if (hasPublishingFeature) {
    return (
      <div className="dark:text-white">
        <h1 className="text-center text-lg font-medium">Publish to the web</h1>
        <p className="mt-4 flex items-center">
          <IconCircleCheck
            size={20}
            className="text-primary-600 dark:text-primary-300"
          />
          <span className="ml-1">
            This page is live on the web. Share it with anyone!
          </span>
        </p>
        <input
          type="text"
          className="mt-4 block w-full rounded border-gray-300 text-sm focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
          value={publicUrl}
          disabled
        />
        <div className="mt-4 flex items-center">
          <button
            className="btn-secondary w-full px-4 py-1 text-center"
            onClick={onUnpublishClick}
          >
            Unpublish
          </button>
          <a
            className="btn ml-2 w-full px-4 py-1 text-center"
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View site
          </a>
        </div>
      </div>
    );
  } else {
    return (
      <div className="dark:text-white">
        <h1 className="text-center text-lg font-medium">Publish to the web</h1>
        <p className="mt-4 flex items-center">
          <IconAlertCircle
            size={20}
            className="flex-shrink-0 text-yellow-600 dark:text-yellow-300"
          />
          <span className="ml-2">
            You don&apos;t have an active Notabase Pro subscription, so this
            note is{' '}
            <span className="font-medium">not live on the web anymore</span>.
            Please{' '}
            <button
              className="link"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              renew your subscription
            </button>{' '}
            to fix this.
          </span>
        </p>
      </div>
    );
  }
}

const publishNestedNotes = async (
  noteTreeItem: NoteTreeItem
): Promise<void> => {
  await Promise.all(publishNestedNotesImpl(noteTreeItem, []));
};

const publishNestedNotesImpl = (
  noteTreeItem: NoteTreeItem,
  promises: Promise<PostgrestSingleResponse<Note>>[]
): Promise<PostgrestSingleResponse<Note>>[] => {
  const promise = updateNote({
    id: noteTreeItem.id,
    visibility: Visibility.Public,
  });

  const newPromises = [...promises, promise];

  if (noteTreeItem.children.length === 0) {
    return newPromises;
  }

  for (const child of noteTreeItem.children) {
    newPromises.push(...publishNestedNotesImpl(child, promises));
  }

  return newPromises;
};
