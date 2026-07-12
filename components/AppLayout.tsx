import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import colors from 'tailwindcss/colors';
import { useStore, store, NoteTreeItem, Notes, SidebarTab } from 'lib/store';
import supabase from 'lib/supabase';
import { Note, SubscriptionStatus } from 'types/supabase';
import { useAuth } from 'utils/useAuth';
import useHotkeys from 'utils/useHotkeys';
import { PlanId, PRICING_PLANS } from 'constants/pricing';
import { isMobile } from 'utils/device';
import { getNoteTreeItem } from 'lib/storeUtils';
import { refreshBacklinkNote } from 'lib/api/loadBacklinkIndex';
import Sidebar from './sidebar/Sidebar';
import FindOrCreateModal from './FindOrCreateModal';
import PageLoading from './PageLoading';
import SettingsModal from './settings/SettingsModal';
import UpgradeModal from './UpgradeModal';
import OfflineBanner from './OfflineBanner';
import UpdateBanner from './UpdateBanner';
import UpgradeBanner from './UpgradeBanner';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function AppLayout(props: Props) {
  const { children, className = '' } = props;
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);
  const [areBillingDetailsLoaded, setAreBillingDetailsLoaded] = useState(false);

  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const setIsPageStackingOn = useStore((state) => state.setIsPageStackingOn);
  const setupStore = useCallback(async () => {
    if (!isPageLoaded && isLoaded && user) {
      // Use user's specific store and rehydrate data
      store.persist.clearStorage();
      store.persist.setOptions({
        name: `notabase-storage-${user.id}`,
      });
      await store.persist.rehydrate();
      setIsStoreLoaded(true);

      // If the user is mobile, change the initial values of isSidebarOpen and isPageStackingOn to better suit mobile devices
      // TODO: ideally this change would be temporary so that we don't override the user's existing values
      if (isMobile()) {
        setIsSidebarOpen(false);
        setIsPageStackingOn(false);
      }
    }
  }, [isPageLoaded, isLoaded, user, setIsSidebarOpen, setIsPageStackingOn]);

  useEffect(() => {
    setupStore();
  }, [setupStore]);

  const setNotes = useStore((state) => state.setNotes);
  const setLoadedNoteContent = useStore((state) => state.setLoadedNoteContent);
  const setBacklinkNotes = useStore((state) => state.setBacklinkNotes);
  const setIsBacklinkIndexLoaded = useStore(
    (state) => state.setIsBacklinkIndexLoaded
  );
  const setNoteTree = useStore((state) => state.setNoteTree);
  const initData = useCallback(async () => {
    if (!user) {
      return;
    }

    const { data: notes } = await supabase
      .from('notes')
      .select('id, user_id, title, created_at, updated_at, visibility')
      .eq('user_id', user.id)
      .order('title');

    // Redirect to most recent note or first note in database
    if (router.pathname === '/app') {
      const openNoteIds = store.getState().openNoteIds;
      if (
        openNoteIds.length > 0 &&
        notes &&
        notes.findIndex((note) => note.id === openNoteIds[0]) > -1
      ) {
        router.replace(`/app/note/${openNoteIds[0]}`);
        return;
      } else if (notes && notes.length > 0) {
        router.replace(`/app/note/${notes[0].id}`);
        return;
      }
    }

    if (!notes) {
      setIsPageLoaded(true);
      return;
    }

    // Set notes
    const notesAsObj = notes.reduce<Record<Note['id'], Note>>((acc, note) => {
      acc[note.id] = { ...note, content: [] };
      return acc;
    }, {});
    setLoadedNoteContent({});
    setBacklinkNotes({});
    setIsBacklinkIndexLoaded(false);
    setNotes(notesAsObj);

    // Set note tree
    const { data: userData } = await supabase
      .from('users')
      .select('note_tree')
      .eq('id', user.id)
      .single();
    if (userData?.note_tree) {
      const noteTree: NoteTreeItem[] = [...userData.note_tree];
      // This is a sanity check for removing notes in the noteTree that do not exist
      removeNonexistentNotes(noteTree, notesAsObj);
      // If there are notes that are not in the note tree, add them
      // This is a sanity check to make sure there are no orphaned notes
      for (const note of notes) {
        if (getNoteTreeItem(noteTree, note.id) === null) {
          noteTree.push({ id: note.id, children: [], collapsed: true });
        }
      }
      // Use the note tree saved in the database
      setNoteTree(noteTree);
    } else {
      // No note tree in database, just use notes
      setNoteTree(
        notes.map((note) => ({ id: note.id, children: [], collapsed: true }))
      );
    }

    setIsPageLoaded(true);
  }, [
    user,
    router,
    setNotes,
    setNoteTree,
    setLoadedNoteContent,
    setBacklinkNotes,
    setIsBacklinkIndexLoaded,
  ]);

  useEffect(() => {
    if (isLoaded && !user) {
      // Redirect to login page if there is no user logged in
      router.replace('/login');
    } else if (!isPageLoaded && isLoaded && user) {
      // Initialize data if there is a user and the data has not been initialized yet
      initData();
    }
  }, [router, user, isLoaded, isPageLoaded, initData]);

  const setBillingDetails = useStore((state) => state.setBillingDetails);
  const initBillingDetails = useCallback(
    async (userId: string) => {
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select(
            'plan_id, subscription_status, frequency, current_period_end, cancel_at_period_end'
          )
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          const currentPeriodEndDate = new Date(data.current_period_end);
          const isSubscriptionActiveAndNotEnded =
            data.subscription_status === SubscriptionStatus.Active &&
            Date.now() < currentPeriodEndDate.getTime();

          setBillingDetails({
            planId: isSubscriptionActiveAndNotEnded
              ? data.plan_id
              : PlanId.Basic,
            frequency: data.frequency,
            currentPeriodEnd: currentPeriodEndDate,
            cancelAtPeriodEnd: data.cancel_at_period_end,
          });
        } else {
          setBillingDetails({ planId: PlanId.Basic });
        }
      } catch {
        setBillingDetails({ planId: PlanId.Basic });
      } finally {
        setAreBillingDetailsLoaded(true);
      }
    },
    [setBillingDetails]
  );

  // Key this effect on the user id rather than the user object: auth events
  // like token refreshes produce a new user object for the same user, and
  // resetting the loading state for those would unmount the app to a spinner
  const userId = user?.id;
  useEffect(() => {
    if (!userId || !isStoreLoaded) {
      setAreBillingDetailsLoaded(false);
      return;
    }
    setAreBillingDetailsLoaded(false);
    initBillingDetails(userId);
  }, [initBillingDetails, isStoreLoaded, userId]);

  const [isFindOrCreateModalOpen, setIsFindOrCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const darkMode = useStore((state) => state.darkMode);
  const setSidebarTab = useStore((state) => state.setSidebarTab);

  const isUpgradeModalOpen = useStore((state) => state.isUpgradeModalOpen);

  const upsertNote = useStore((state) => state.upsertNote);
  const updateNote = useStore((state) => state.updateNote);
  const deleteNote = useStore((state) => state.deleteNote);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Subscribe to changes on the notes table for the logged in user
    const subscription = supabase
      .channel(`public:notes:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: Note }) => {
          // Notes created by this client are already in the store with their
          // real content; don't overwrite them with the stripped payload
          if (!store.getState().notes[payload.new.id]) {
            upsertNote({ ...payload.new, content: [] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: Note }) => {
          // Don't update the note if it is currently open
          const openNoteIds = store.getState().openNoteIds;
          if (!openNoteIds.includes(payload.new.id)) {
            updateNote({
              id: payload.new.id,
              title: payload.new.title,
              user_id: payload.new.user_id,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at,
              visibility: payload.new.visibility,
            });
            // The payload doesn't include content, so any cached content is
            // now stale; refetch it the next time the note is opened
            store.getState().setNoteContentLoaded(payload.new.id, false);
            refreshBacklinkNote(payload.new.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          deleteNote(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, upsertNote, updateNote, deleteNote]);

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'mod+p',
        callback: () => setIsFindOrCreateModalOpen((isOpen) => !isOpen),
      },
      {
        hotkey: 'mod+s',
        callback: () => {
          /* todo: placeholder for saving */
        },
      },
      {
        hotkey: 'mod+shift+e',
        callback: () => setSidebarTab(SidebarTab.Notes),
      },
      {
        hotkey: 'mod+shift+f',
        callback: () => setSidebarTab(SidebarTab.Search),
      },
      {
        hotkey: 'mod+shift+g',
        callback: () => router.push('/app/graph'),
      },
      {
        hotkey: 'mod+\\',
        callback: () => setIsSidebarOpen((isOpen) => !isOpen),
      },
    ],
    [setIsFindOrCreateModalOpen, setSidebarTab, setIsSidebarOpen, router]
  );
  useHotkeys(hotkeys);

  useEffect(() => {
    const {
      query: {
        checkout_session_id: checkoutSessionId,
        planId,
        ...otherQueryParams
      },
    } = router;

    if (checkoutSessionId) {
      // Show toast if the user successfully subscribed to Notabase
      const plan = PRICING_PLANS[planId as PlanId];
      if (plan) {
        toast.success(`Congrats! You now have Notabase ${plan.name} 🎉`);
      } else {
        toast.success('Congrats! Your payment was processed successfully 🎉');
      }
      router.push(
        { pathname: router.pathname, query: otherQueryParams },
        undefined,
        { shallow: true }
      );
    }
  }, [router]);

  const appContainerClassName = classNames(
    'h-screen',
    { dark: darkMode },
    className
  );

  const head = (
    <Head>
      <meta
        name="theme-color"
        content={darkMode ? colors.neutral[900] : colors.white}
      />
    </Head>
  );

  if (!isPageLoaded || !areBillingDetailsLoaded) {
    return (
      <>
        {head}
        <PageLoading />
      </>
    );
  }

  return (
    <>
      {head}
      <div id="app-container" className={appContainerClassName}>
        <div className="flex h-full w-full dark:bg-gray-900">
          <Sidebar
            setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
            setIsSettingsOpen={setIsSettingsOpen}
          />
          <div className="relative flex flex-1 flex-col overflow-y-hidden">
            <OfflineBanner />
            <UpdateBanner />
            <UpgradeBanner />
            {children}
          </div>
          {isSettingsOpen ? (
            <SettingsModal setIsOpen={setIsSettingsOpen} />
          ) : null}
          {isFindOrCreateModalOpen ? (
            <FindOrCreateModal setIsOpen={setIsFindOrCreateModalOpen} />
          ) : null}
          {isUpgradeModalOpen ? <UpgradeModal /> : null}
        </div>
      </div>
    </>
  );
}

const removeNonexistentNotes = (tree: NoteTreeItem[], notes: Notes) => {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (!notes[item.id]) {
      tree.splice(i, 1);
    } else if (item.children.length > 0) {
      removeNonexistentNotes(item.children, notes);
    }
  }
};
