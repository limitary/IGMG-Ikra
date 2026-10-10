import { describe, expect, it } from 'vitest';
import { LESSONS, LETTERS, lessonLetters } from './content';
import { buildQuiz, scorePercent, seededRandom } from './quiz';

describe('buildQuiz', () => {
  it('maakt één vraag per letter met 4 unieke opties waaronder het goede antwoord', () => {
    for (const lesson of LESSONS) {
      const letters = lessonLetters(lesson);
      const quiz = buildQuiz(letters, LETTERS, seededRandom(42));
      expect(quiz).toHaveLength(letters.length);
      for (const q of quiz) {
        const ids = q.options.map((o) => o.id);
        expect(ids).toContain(q.letter.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.length).toBe(4);
      }
    }
  });
  it('rekent scores goed uit', () => {
    expect(scorePercent(3, 4)).toBe(75);
    expect(scorePercent(0, 0)).toBe(0);
  });
});
