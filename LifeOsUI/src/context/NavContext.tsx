import { createContext, useState, type ReactNode } from 'react';

export type Page = 'landing' | 'auth' | 'app';

interface NavContextValue {
  page: Page;
  goTo: (p: Page) => void;
}

export const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('landing');
  return (
    <NavContext.Provider value={{ page, goTo: setPage }}>
      {children}
    </NavContext.Provider>
  );
}
