import * as fs from 'node:fs';
import * as path from 'node:path';

// Lokale opslag voor instellingen en voortgang. Alles blijft op deze
// computer in de gebruikersmap van de app; er wordt niets verstuurd.

export const STORE_FILE = 'ikra-data.json';
export const STORE_SCHEMA_VERSION = 1;
export const ALLOWED_KEYS = ['settings', 'progress'] as const;
export type StoreKey = (typeof ALLOWED_KEYS)[number];

const MAX_VALUE_BYTES = 256 * 1024;

export interface StoreData {
  schemaVersion: number;
  settings?: unknown;
  progress?: unknown;
}

export function isStoreKey(key: unknown): key is StoreKey {
  return typeof key === 'string' && (ALLOWED_KEYS as readonly string[]).includes(key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Controleert dat een waarde een klein, gewoon JSON-object is. */
export function validateValue(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) throw new Error('Waarde moet een object zijn');
  const json = JSON.stringify(value);
  if (Buffer.byteLength(json, 'utf8') > MAX_VALUE_BYTES) throw new Error('Waarde is te groot');
  return JSON.parse(json) as Record<string, unknown>;
}

export class JsonStore {
  readonly file: string;
  readonly backup: string;

  constructor(private readonly dir: string) {
    this.file = path.join(dir, STORE_FILE);
    this.backup = this.file + '.bak';
  }

  private readFile(file: string): StoreData | null {
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!isPlainObject(parsed)) return null;
      return { ...parsed, schemaVersion: Number(parsed.schemaVersion) || STORE_SCHEMA_VERSION };
    } catch {
      return null;
    }
  }

  read(): StoreData {
    if (!fs.existsSync(this.file)) {
      return this.readFile(this.backup) ?? { schemaVersion: STORE_SCHEMA_VERSION };
    }
    const data = this.readFile(this.file);
    if (data) return data;

    // Beschadigd bestand: niet weggooien, maar apart bewaren en de backup gebruiken.
    const corruptCopy = `${this.file}.corrupt-${Date.now()}`;
    try {
      fs.renameSync(this.file, corruptCopy);
    } catch {
      // Als hernoemen niet lukt, gaan we gewoon door met de backup.
    }
    return this.readFile(this.backup) ?? { schemaVersion: STORE_SCHEMA_VERSION };
  }

  write(key: unknown, value: unknown): StoreData {
    if (!isStoreKey(key)) throw new Error('Onbekende opslagsleutel');
    const clean = validateValue(value);
    const data: StoreData = { ...this.read(), schemaVersion: STORE_SCHEMA_VERSION, [key]: clean };

    fs.mkdirSync(this.dir, { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    if (fs.existsSync(this.file)) fs.copyFileSync(this.file, this.backup);
    fs.renameSync(tmp, this.file);
    return data;
  }
}
