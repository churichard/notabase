import type { ReactNode } from 'react';
import { useContext, createContext } from 'react';

type CurrentNote = {
  id: string;
};

const NoteContext = createContext<CurrentNote | undefined>(undefined);

export function ProvideCurrentNote({
  children,
  value,
}: {
  children: ReactNode;
  value: CurrentNote;
}) {
  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export const useCurrentNote = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useCurrentNote must be used within a provider');
  }
  return context;
};
