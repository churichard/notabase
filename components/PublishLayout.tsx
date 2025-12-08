import classNames from 'classnames';
import Head from 'next/head';
import { useEffect, useState, cloneElement, ReactElement, useRef } from 'react';
import colors from 'tailwindcss/colors';
import { useRouter } from 'next/router';
import { useStore } from 'lib/store';
import supabase from 'lib/supabase';
import PageLoading from './PageLoading';

type Props = {
  children: ReactElement;
};

export default function PublishLayout(props: Props) {
  const { children } = props;
  const darkMode = useStore((state) => state.darkMode);
  const appContainerClassName = classNames('h-screen', { dark: darkMode });

  const router = useRouter();
  const {
    query: { siteId },
  } = router;

  const [isPublishActive, setIsPublishActive] = useState<boolean | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchBillingDetails = async (siteIdValue: string) => {
      const { data } = await supabase
        .from('sites')
        .select('id, user_id, is_active')
        .eq('id', siteIdValue)
        .maybeSingle();

      if (data) {
        userIdRef.current = data.user_id;
        setIsPublishActive(data.is_active);
      }
    };
    if (typeof siteId === 'string') {
      fetchBillingDetails(siteId);
    }
  }, [siteId]);

  const head = (
    <Head>
      <meta
        name="theme-color"
        content={darkMode ? colors.neutral[900] : colors.white}
      />
    </Head>
  );

  if (isPublishActive === null) {
    return (
      <>
        {head}
        <PageLoading />
      </>
    );
  } else {
    return (
      <>
        {head}
        <div id="app-container" className={appContainerClassName}>
          <div className="flex h-full w-full dark:bg-gray-900">
            <div className="relative flex flex-1 flex-col overflow-y-hidden">
              {cloneElement(children, {
                userId: userIdRef.current,
                isPublishActive,
              })}
            </div>
          </div>
        </div>
      </>
    );
  }
}
