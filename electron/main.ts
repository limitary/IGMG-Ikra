import { app, BrowserWindow, ipcMain, Menu, protocol, session } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import {
  APP_ORIGIN,
  APP_SCHEME,
  CONTENT_SECURITY_POLICY,
  isAllowedRequestUrl,
  mimeTypeFor,
  parseRange,
  resolveAppPath,
} from './protocol';
import { JsonStore } from './store';

// Voor tests: een apart, tijdelijk profiel gebruiken zodat echte
// leerlinggegevens nooit worden aangeraakt.
if (process.env.IKRA_USER_DATA_DIR) {
  app.setPath('userData', path.resolve(process.env.IKRA_USER_DATA_DIR));
}

const DIST_DIR = path.join(__dirname, '..', 'dist');
const blockedRequests: string[] = [];
const allRequests: string[] = [];
(globalThis as Record<string, unknown>).__ikraBlockedRequests = blockedRequests;
// Alleen tijdens tests: alle opgevraagde URL's bijhouden ter controle.
const recordRequests = process.env.IKRA_RECORD_REQUESTS === '1';
(globalThis as Record<string, unknown>).__ikraAllRequests = allRequests;

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
]);

function notFound(): Response {
  return new Response('Niet gevonden', { status: 404, headers: { 'content-type': 'text/plain' } });
}

function serveAppFile(request: Request): Response {
  const filePath = resolveAppPath(request.url, DIST_DIR);
  if (!filePath) return notFound();

  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return notFound();
  }
  if (!stat.isFile()) return notFound();

  const headers: Record<string, string> = {
    'content-type': mimeTypeFor(filePath),
    'accept-ranges': 'bytes',
    'x-content-type-options': 'nosniff',
  };
  if (filePath.endsWith('.html')) headers['content-security-policy'] = CONTENT_SECURITY_POLICY;

  const range = parseRange(request.headers.get('range'), stat.size);
  if (range) {
    const stream = fs.createReadStream(filePath, { start: range.start, end: range.end });
    headers['content-range'] = `bytes ${range.start}-${range.end}/${stat.size}`;
    headers['content-length'] = String(range.end - range.start + 1);
    return new Response(Readable.toWeb(stream) as ReadableStream, { status: 206, headers });
  }

  headers['content-length'] = String(stat.size);
  const stream = fs.createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as ReadableStream, { status: 200, headers });
}

function lockDownSession(): void {
  const ses = session.defaultSession;

  // Blokkeer elk verzoek dat niet uit de app zelf komt (internet, LAN, localhost).
  ses.webRequest.onBeforeRequest((details, callback) => {
    if (recordRequests) allRequests.push(details.url);
    if (isAllowedRequestUrl(details.url)) return callback({});
    blockedRequests.push(details.url);
    console.warn('[ikra] Netwerkverzoek geblokkeerd:', details.url);
    callback({ cancel: true });
  });

  // Geen camera, microfoon, locatie, meldingen, enz.
  ses.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  ses.setPermissionCheckHandler(() => false);
}

function registerStoreIpc(store: JsonStore): void {
  const fromApp = (event: Electron.IpcMainInvokeEvent) =>
    event.senderFrame?.url.startsWith(APP_ORIGIN + '/') ?? false;

  ipcMain.handle('ikra:store:read', (event) => {
    if (!fromApp(event)) throw new Error('Niet toegestaan');
    return store.read();
  });
  ipcMain.handle('ikra:store:write', (event, key: unknown, value: unknown) => {
    if (!fromApp(event)) throw new Error('Niet toegestaan');
    store.write(key, value);
    return true;
  });
  ipcMain.handle('ikra:app:info', (event) => {
    if (!fromApp(event)) throw new Error('Niet toegestaan');
    return { version: app.getVersion(), dataFile: store.file, packaged: app.isPackaged };
  });
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#f6f4ef',
    title: 'IGMG İkra',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  // Niet weg-navigeren uit de app en geen nieuwe vensters openen.
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(APP_ORIGIN + '/')) event.preventDefault();
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // F11 = volledig scherm (handig op een smartboard).
  win.webContents.on('before-input-event', (_event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') win.setFullScreen(!win.isFullScreen());
    if (!app.isPackaged && input.type === 'keyDown' && input.control && input.shift && input.key === 'I') {
      win.webContents.toggleDevTools();
    }
  });

  void win.loadURL(`${APP_ORIGIN}/index.html`);
  return win;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    protocol.handle(APP_SCHEME, serveAppFile);
    lockDownSession();
    registerStoreIpc(new JsonStore(app.getPath('userData')));
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
