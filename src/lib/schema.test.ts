import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, recordQuizResult, recordStep, sanitizeProgress, sanitizeSettings } from './schema';

describe('sanitizeSettings', () => {
  it('geeft standaardwaarden bij ontbrekende of foute gegevens', () => {
    expect(sanitizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings({ language: 'fr', arabicScale: 'x' })).toEqual(DEFAULT_SETTINGS);
  });
  it('behoudt geldige waarden', () => {
    expect(sanitizeSettings({ language: 'de', onboarded: true, arabicScale: 1.5 })).toEqual({
      language: 'de',
      onboarded: true,
      arabicScale: 1.5,
    });
  });
});

describe('progress', () => {
  it('behoudt bestaande voortgang en negeert rommel', () => {
    const p = sanitizeProgress({ lessons: { a: { completed: true, bestScore: 150, lastStep: 2 }, b: 'x' } });
    expect(p).toEqual({ lessons: { a: { completed: true, bestScore: 100, lastStep: 2 } } });
  });
  it('bewaart de beste score', () => {
    let p = recordQuizResult({ lessons: {} }, 'a', 75);
    p = recordQuizResult(p, 'a', 50);
    expect(p.lessons.a).toEqual({ completed: true, bestScore: 75, lastStep: 0 });
    p = recordStep(p, 'a', 3);
    expect(p.lessons.a.lastStep).toBe(3);
    expect(recordStep(p, 'a', 3)).toBe(p);
  });
});
