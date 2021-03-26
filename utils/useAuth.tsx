import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
  useCallback,
} from 'react';
import { User, Provider, Session } from '@supabase/supabase-js';
import supabase from 'lib/supabase';

type AuthContextType = {
  isLoaded: boolean;
  user: User | null;
  setUser: (user: User) => void;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    session: Session | null;
    user: User | null;
    provider?: Provider;
    url?: string | null;
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    user: User | null;
    session: Session | null;
    error: Error | null;
    data: Session | User | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider hook that creates auth object and handles state
function useProvideAuth(): AuthContextType {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Updates the user and sets isLoaded to true
  const updateUser = useCallback((user: User | null) => {
    setUser(user);
    setIsLoaded(true);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await supabase.auth.signIn({
        email,
        password,
      });
      updateUser(response.user);
      return response;
    },
    [updateUser]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const response = await supabase.auth.signUp(
        {
          email,
          password,
        },
        { redirectTo: `${process.env.BASE_URL}/app` }
      );
      updateUser(response.user);
      return response;
    },
    [updateUser]
  );

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Set auth cookie and update user
        fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        });
        updateUser(session?.user ?? null);
      }
    );
    return () => authListener?.unsubscribe();
  }, [updateUser]);

  // Return the user object and auth methods
  return {
    isLoaded,
    user,
    setUser: updateUser,
    signIn,
    signUp,
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
