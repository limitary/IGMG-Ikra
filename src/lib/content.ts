import type { Language, Localized } from '../i18n';
import lettersJson from '../content/letters.json';
import lessonsJson from '../content/lessons.json';
import listeningJson from '../content/listening.json';
import pdfsJson from '../content/pdfs.json';

// Alle inhoud wordt bij het bouwen in de app meegenomen. Audio en PDF's
// staan in public/content en worden met een relatief pad geladen.

export interface Letter {
  id: string;
  char: string;
  name: string;
}

export interface Lesson {
  id: string;
  demo?: boolean;
  title: Localized;
  teacherNote: Localized;
  letters: string[];
}

export interface ListeningItem {
  id: string;
  demo?: boolean;
  title: Localized;
  lines: string[];
  audio: string | null;
}

export interface PdfItem {
  id: string;
  demo?: boolean;
  title: Localized;
  file: string;
}

export const LETTERS: Letter[] = lettersJson;
export const LESSONS: Lesson[] = lessonsJson;
export const LISTENING: ListeningItem[] = listeningJson;
export const PDFS: PdfItem[] = pdfsJson;

const lettersById = new Map(LETTERS.map((l) => [l.id, l]));

export function getLetter(id: string): Letter {
  const letter = lettersById.get(id);
  if (!letter) throw new Error(`Onbekende letter: ${id}`);
  return letter;
}

export function lessonLetters(lesson: Lesson): Letter[] {
  return lesson.letters.map(getLetter);
}

export function letterAudio(letter: Letter): string {
  return `content/audio/demo-${letter.id}.wav`;
}

/** Relatieve URL naar een meegeleverd bestand (werkt in app:// en in de browser). */
export function assetUrl(relativePath: string): string {
  return new URL(relativePath.replace(/^\/+/, ''), document.baseURI).href;
}

export function localize(text: Localized, lang: Language): string {
  return text[lang] || text.nl;
}
