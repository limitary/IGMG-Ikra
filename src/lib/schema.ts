import { isLanguage, type Language } from '../i18n';

// Vorm van de opgeslagen gegevens. 'sanitize'-functies vullen ontbrekende of
// ongeldige waarden aan met standaardwaarden, zodat een oud of beschadigd
// bestand de app nooit laat vastlopen en bestaande voortgang behouden blijft.

export interface Settings {
  language: Language;
  onboarded: boolean;
  arabicScale: number;
}

export interface LessonProgress {
  completed: boolean;
  bestScore: number;
  lastStep: number;
}

export interface Progress {
  lessons: Record<string, LessonProgress>;
}

export const ARABIC_SCALES = [0.8, 1, 1.25, 1.5, 2] as const;

export const DEFAULT_SETTINGS: Settings = { language: 'nl', onboarded: false, arabicScale: 1 };
export const EMPTY_PROGRESS: Progress = { lessons: {} };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export function sanitizeSettings(raw: unknown): Settings {
  if (!isObject(raw)) return { ...DEFAULT_SETTINGS };
  return {
    language: isLanguage(raw.language) ? raw.language : DEFAULT_SETTINGS.language,
    onboarded: raw.onboarded === true,
    arabicScale: clampNumber(raw.arabicScale, 0.5, 3, DEFAULT_SETTINGS.arabicScale),
  };
}

export function sanitizeProgress(raw: unknown): Progress {
  const lessons: Record<string, LessonProgress> = {};
  if (isObject(raw) && isObject(raw.lessons)) {
    for (const [id, entry] of Object.entries(raw.lessons)) {
      if (!isObject(entry)) continue;
      lessons[id] = {
        completed: entry.completed === true,
        bestScore: Math.round(clampNumber(entry.bestScore, 0, 100, 0)),
        lastStep: Math.floor(clampNumber(entry.lastStep, 0, 1000, 0)),
      };
    }
  }
  return { lessons };
}

export function recordQuizResult(progress: Progress, lessonId: string, score: number): Progress {
  const previous = progress.lessons[lessonId] ?? { completed: false, bestScore: 0, lastStep: 0 };
  return {
    lessons: {
      ...progress.lessons,
      [lessonId]: {
        ...previous,
        completed: true,
        bestScore: Math.max(previous.bestScore, Math.round(score)),
      },
    },
  };
}

export function recordStep(progress: Progress, lessonId: string, step: number): Progress {
  const previous = progress.lessons[lessonId] ?? { completed: false, bestScore: 0, lastStep: 0 };
  if (previous.lastStep === step) return progress;
  return { lessons: { ...progress.lessons, [lessonId]: { ...previous, lastStep: step } } };
}
