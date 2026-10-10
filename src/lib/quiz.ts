import type { Letter } from './content';

export interface QuizQuestion {
  letter: Letter;
  options: Letter[];
}

/** Eenvoudige voorspelbare random-generator, zodat tests herhaalbaar zijn. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Maakt per letter van de les één vraag met maximaal 4 antwoordopties.
 * Foute opties komen eerst uit dezelfde les, daarna uit alle letters.
 */
export function buildQuiz(lessonLetters: Letter[], allLetters: Letter[], random: () => number): QuizQuestion[] {
  return shuffle(lessonLetters, random).map((letter) => {
    const pool = [...lessonLetters, ...allLetters].filter(
      (l, index, list) => l.id !== letter.id && list.findIndex((x) => x.id === l.id) === index,
    );
    const distractors = shuffle(pool.slice(0, Math.max(3, lessonLetters.length - 1)), random).slice(0, 3);
    return { letter, options: shuffle([letter, ...distractors], random) };
  });
}

export function scorePercent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
