import { createContext, useContext } from 'react';
import type { Language, TextKey } from './i18n';
import type { Progress, Settings } from './lib/schema';

export type Route =
  | { name: 'dashboard' }
  | { name: 'lessons' }
  | { name: 'lesson'; id: string }
  | { name: 'listening' }
  | { name: 'pdfs' }
  | { name: 'pdf'; id: string }
  | { name: 'settings' };

export interface AppState {
  lang: Language;
  t: (key: TextKey, vars?: Record<string, string | number>) => string;
  settings: Settings;
  progress: Progress;
  updateSettings: (change: Partial<Settings>) => void;
  updateProgress: (update: (previous: Progress) => Progress) => void;
  navigate: (route: Route) => void;
  goBack: () => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp buiten AppContext');
  return value;
}

/** Bovenliggend scherm, gebruikt voor de terugknop en de Esc-toets. */
export function parentRoute(route: Route): Route | null {
  switch (route.name) {
    case 'dashboard':
      return null;
    case 'lesson':
      return { name: 'lessons' };
    case 'pdf':
      return { name: 'pdfs' };
    default:
      return { name: 'dashboard' };
  }
}
