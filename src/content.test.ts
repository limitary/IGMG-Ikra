import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_TEXTS, LANGUAGES } from './i18n';
import { LESSONS, LISTENING, PDFS, lessonLetters, letterAudio } from './lib/content';

const publicDir = resolve(__dirname, '..', 'public');

describe('inhoud', () => {
  it('heeft alle teksten in TR, NL en DE', () => {
    for (const [key, text] of Object.entries(ALL_TEXTS)) {
      for (const lang of LANGUAGES) expect(text[lang], `${key}.${lang}`).toBeTruthy();
    }
    for (const item of [...LESSONS, ...LISTENING, ...PDFS]) {
      for (const lang of LANGUAGES) expect(item.title[lang], `${item.id}.${lang}`).toBeTruthy();
    }
  });

  it('verwijst alleen naar lokale bestanden die echt bestaan', () => {
    const files = [
      ...LESSONS.flatMap((l) => lessonLetters(l).map(letterAudio)),
      ...LISTENING.flatMap((i) => (i.audio ? [i.audio] : [])),
      ...PDFS.map((p) => p.file),
    ];
    for (const file of files) {
      expect(file).not.toMatch(/^[a-z]+:\/\//i);
      expect(existsSync(resolve(publicDir, file)), file).toBe(true);
    }
  });
});
