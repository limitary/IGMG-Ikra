import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isAllowedRequestUrl, mimeTypeFor, parseRange, resolveAppPath } from './protocol';

const root = path.resolve('/opt/ikra/dist');

describe('resolveAppPath', () => {
  it('zet app-URL om naar een bestand in de app-map', () => {
    expect(resolveAppPath('app://ikra/index.html', root)).toBe(path.join(root, 'index.html'));
    expect(resolveAppPath('app://ikra/', root)).toBe(path.join(root, 'index.html'));
    expect(resolveAppPath('app://ikra/content/pdf/demo%20boek.pdf', root)).toBe(
      path.join(root, 'content/pdf/demo boek.pdf'),
    );
  });

  it('blijft altijd binnen de app-map', () => {
    for (const url of [
      'app://ikra/../../etc/passwd',
      'app://ikra/%2e%2e/%2e%2e/etc/passwd',
      'app://ikra/..%2F..%2Fetc%2Fpasswd',
      'app://ikra/..%5C..%5Cetc%5Cpasswd',
    ]) {
      const resolved = resolveAppPath(url, root);
      if (resolved !== null) expect(resolved.startsWith(root + path.sep)).toBe(true);
    }
  });

  it('weigert vreemde hosts en ongeldige paden', () => {
    expect(resolveAppPath('app://other/index.html', root)).toBeNull();
    expect(resolveAppPath('https://ikra/index.html', root)).toBeNull();
    expect(resolveAppPath('app://ikra/a%00b', root)).toBeNull();
  });
});

describe('parseRange', () => {
  it('leest geldige ranges', () => {
    expect(parseRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 });
    expect(parseRange('bytes=500-', 1000)).toEqual({ start: 500, end: 999 });
    expect(parseRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange('bytes=900-5000', 1000)).toEqual({ start: 900, end: 999 });
  });
  it('weigert ongeldige ranges', () => {
    expect(parseRange(null, 1000)).toBeNull();
    expect(parseRange('bytes=1000-', 1000)).toBeNull();
    expect(parseRange('bytes=50-10', 1000)).toBeNull();
    expect(parseRange('items=0-1', 1000)).toBeNull();
  });
});

describe('isAllowedRequestUrl', () => {
  it('staat alleen eigen app-bestanden toe', () => {
    expect(isAllowedRequestUrl('app://ikra/assets/x.js')).toBe(true);
    expect(isAllowedRequestUrl('data:image/png;base64,AA')).toBe(true);
    expect(isAllowedRequestUrl('blob:app://ikra/123')).toBe(true);
    expect(isAllowedRequestUrl('https://cdn.example.com/x.js')).toBe(false);
    expect(isAllowedRequestUrl('http://192.168.31.42:5173/')).toBe(false);
    expect(isAllowedRequestUrl('http://localhost:5173/')).toBe(false);
    expect(isAllowedRequestUrl('file:///etc/passwd')).toBe(false);
    expect(isAllowedRequestUrl('ws://localhost:1234')).toBe(false);
    expect(isAllowedRequestUrl('app://evil/x')).toBe(false);
  });
});

it('geeft juiste bestandstypes', () => {
  expect(mimeTypeFor('a.mjs')).toContain('javascript');
  expect(mimeTypeFor('a.WAV')).toBe('audio/wav');
  expect(mimeTypeFor('a.pdf')).toBe('application/pdf');
  expect(mimeTypeFor('a.unknown')).toBe('application/octet-stream');
});
