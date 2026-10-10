import { sanitizeProgress, sanitizeSettings, type Progress, type Settings } from './schema';

// Opslag: in de desktopapp via Electron naar een lokaal bestand;
// in de browservoorbeeldweergave (alleen voor ontwikkeling) via localStorage.

interface IkraBridge {
  readStore(): Promise<unknown>;
  writeStore(key: 'settings' | 'progress', value: unknown): Promise<boolean>;
  appInfo(): Promise<unknown>;
}

export interface AppInfo {
  version: string;
  dataFile: string;
  packaged: boolean;
}

declare global {
  interface Window {
    ikra?: IkraBridge;
  }
}

const LOCAL_PREFIX = 'ikra:';

export function isDesktop(): boolean {
  return typeof window !== 'undefined' && window.ikra !== undefined;
}

function readLocal(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(LOCAL_PREFIX + key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export async function loadAll(): Promise<{ settings: Settings; progress: Progress }> {
  if (window.ikra) {
    const data = (await window.ikra.readStore()) as { settings?: unknown; progress?: unknown } | null;
    return { settings: sanitizeSettings(data?.settings), progress: sanitizeProgress(data?.progress) };
  }
  return { settings: sanitizeSettings(readLocal('settings')), progress: sanitizeProgress(readLocal('progress')) };
}

export async function save(key: 'settings' | 'progress', value: Settings | Progress): Promise<void> {
  if (window.ikra) {
    await window.ikra.writeStore(key, value);
    return;
  }
  window.localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
}

export async function getAppInfo(): Promise<AppInfo | null> {
  if (!window.ikra) return null;
  return (await window.ikra.appInfo()) as AppInfo;
}
