import classNames from 'classnames';
import Head from 'next/head';
import type { ReactNode } from 'react';
import colors from 'tailwindcss/colors';
import { useStore } from 'lib/store';

type Props = {
  children: ReactNode;
};

export default function PublishLayout(props: Props) {
  const { children } = props;
  const darkMode = useStore((state) => state.darkMode);
  const appContainerClassName = classNames('h-screen', { dark: darkMode });
  return (
    <>
      <Head>
        <meta
          name="theme-color"
          content={darkMode ? colors.neutral[900] : colors.white}
        />
      </Head>
      <div id="app-container" className={appContainerClassName}>
        <div className="flex h-full w-full dark:bg-gray-900">
          <div className="relative flex flex-1 flex-col overflow-y-hidden">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
