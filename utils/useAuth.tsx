import type { ReactNode } from 'react';
import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react';
import type { User, GoTrueClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import supabase from 'lib/supabase';

type AuthContextType = {
  isLoaded: boolean;
  user: User | null;
  signIn: (
    email: string,
    password: string
  ) => ReturnType<GoTrueClient['signIn']>;
  signUp: (
    email: string,
    password: string
  ) => ReturnType<GoTrueClient['signUp']>;
  signOut: () => ReturnType<GoTrueClient['signOut']>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider hook that creates auth object and handles state
function useProvideAuth(): AuthContextType {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Updates the user and sets isLoaded to true
  const updateUser = useCallback((user: User | null) => {
    setUser(user);
    setIsLoaded(true);
  }, []);

  // Initialize the user
  useEffect(() => {
    updateUser(supabase.auth.user());
  }, [updateUser]);

  const signIn = useCallback(
    (email: string, password: string) =>
      supabase.auth.signIn({
        email,
        password,
      }),
    []
  );

  const signUp = useCallback(
    (email: string, password: string) =>
      supabase.auth.signUp(
        {
          email,
          password,
        },
        { redirectTo: `${process.env.BASE_URL}/app` }
      ),
    []
  );

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Set auth cookie and update user
        await fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        });
        updateUser(session?.user ?? null);

        // Redirect to /app if the user has signed in
        if (event === 'SIGNED_IN' && router.pathname === '/login') {
          router.push('/app');
        } else if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );
    return () => authListener?.unsubscribe();
  }, [router, updateUser]);

  // Return the user object and auth methods
  return {
    isLoaded,
    user,
    signIn,
    signUp,
    signOut,
  };
}

// Provider component that wraps your app and makes auth object
// available to any child component that calls useAuth().
export function ProvideAuth({ children }: { children: ReactNode }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Hook for child components to get the auth object and re-render when it changes.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a provider');
  }
  return context;
};
