import React, { useContext, createContext, ReactNode } from 'react';

type NoteContextType = {
  id: string;
  title: string;
};

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function ProvideCurrentNote({
  children,
  value,
}: {
  children: ReactNode;
  value: NoteContextType;
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
