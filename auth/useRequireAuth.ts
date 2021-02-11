import { useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from 'lib/supabase';

export default function useRequireAuth(redirectUrl = '/login') {
  const router = useRouter();
  const user = supabase.auth.user();

  useEffect(() => {
    if (!user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  return user;
}
