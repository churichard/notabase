import { useRouter } from 'next/router';

/**
 * @returns Boolean specifying whether or not the user is currently on a public Publish page.
 */
export default function useIsPublish() {
  const router = useRouter();
  return router.pathname.startsWith('/publish');
}
