// Brug tussen de app-schermen en Electron. Bewust klein: alleen lezen en
// schrijven van instellingen/voortgang en wat app-informatie.
// Geschreven als script (zonder import/export) omdat sandbox-preloads
// alleen 'electron' mogen laden.
const { contextBridge, ipcRenderer } = require('electron') as typeof import('electron');

contextBridge.exposeInMainWorld('ikra', {
  readStore: (): Promise<unknown> => ipcRenderer.invoke('ikra:store:read'),
  writeStore: (key: 'settings' | 'progress', value: unknown): Promise<boolean> =>
    ipcRenderer.invoke('ikra:store:write', key, value),
  appInfo: (): Promise<unknown> => ipcRenderer.invoke('ikra:app:info'),
});
