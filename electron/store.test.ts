import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JsonStore, STORE_FILE } from './store';

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ikra-store-'));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('JsonStore', () => {
  it('begint leeg en bewaart waarden', () => {
    const store = new JsonStore(dir);
    expect(store.read()).toEqual({ schemaVersion: 1 });
    store.write('settings', { language: 'tr' });
    store.write('progress', { lessons: { 'les-1': { completed: true } } });
    const again = new JsonStore(dir).read();
    expect(again.settings).toEqual({ language: 'tr' });
    expect(again.progress).toEqual({ lessons: { 'les-1': { completed: true } } });
  });

  it('weigert onbekende sleutels en foute waarden', () => {
    const store = new JsonStore(dir);
    expect(() => store.write('__proto__', {})).toThrow();
    expect(() => store.write('other', {})).toThrow();
    expect(() => store.write('settings', 'tekst')).toThrow();
    expect(() => store.write('settings', [1, 2])).toThrow();
    expect(() => store.write('settings', { big: 'x'.repeat(300 * 1024) })).toThrow();
  });

  it('valt terug op de backup bij een beschadigd bestand en gooit niets weg', () => {
    const store = new JsonStore(dir);
    store.write('settings', { language: 'de' });
    store.write('settings', { language: 'nl' });
    fs.writeFileSync(path.join(dir, STORE_FILE), '{kapot', 'utf8');
    const data = store.read();
    expect(data.settings).toEqual({ language: 'de' });
    const corrupt = fs.readdirSync(dir).filter((f) => f.includes('.corrupt-'));
    expect(corrupt).toHaveLength(1);
  });
});
