import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { DemoBanner, Page } from '../components/Layout';
import { LESSONS, LETTERS, lessonLetters, letterAudio, localize, type Lesson } from '../lib/content';
import { buildQuiz, scorePercent, seededRandom } from '../lib/quiz';
import { recordQuizResult, recordStep } from '../lib/schema';
import { useAudio } from '../lib/useAudio';

type Mode = 'teacher' | 'student';

export function LessonView({ lessonId }: { lessonId: string }) {
  const { t, lang } = useApp();
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const [mode, setMode] = useState<Mode>('teacher');

  if (!lesson) return <Page title={t('lessons')}>?</Page>;

  return (
    <Page
      title={localize(lesson.title, lang)}
      actions={
        <div className="segmented" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'teacher'} onClick={() => setMode('teacher')}>
            {t('teacherMode')}
          </button>
          <button type="button" role="tab" aria-selected={mode === 'student'} onClick={() => setMode('student')}>
            {t('studentMode')}
          </button>
        </div>
      }
    >
      {lesson.demo && <DemoBanner />}
      {mode === 'teacher' ? <TeacherMode lesson={lesson} /> : <StudentMode lesson={lesson} />}
    </Page>
  );
}

function TeacherMode({ lesson }: { lesson: Lesson }) {
  const { t, lang, progress, updateProgress } = useApp();
  const letters = lessonLetters(lesson);
  const saved = progress.lessons[lesson.id]?.lastStep ?? 0;
  const [step, setStep] = useState(Math.min(saved, letters.length - 1));
  const letter = letters[step];
  const audio = useAudio(letterAudio(letter));

  useEffect(() => {
    updateProgress((p) => recordStep(p, lesson.id, step));
  }, [lesson.id, step, updateProgress]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setStep((s) => Math.min(letters.length - 1, s + 1));
      else if (event.key === 'ArrowLeft') setStep((s) => Math.max(0, s - 1));
      else if (event.key === ' ') {
        event.preventDefault();
        audio.toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [letters.length, audio]);

  return (
    <div className="teacher">
      <div className="letter-card">
        <span className="arabic huge" lang="ar" dir="rtl" data-testid="letter">
          {letter.char}
        </span>
        <span className="letter-name">{letter.name}</span>
        <button type="button" className="btn primary" onClick={audio.toggle}>
          {audio.status === 'playing' ? t('pause') : `▶ ${t('play')}`}
        </button>
        {audio.status === 'error' && <p className="warning">{t('audioError')}</p>}
      </div>
      <div className="stepper">
        <button type="button" className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← {t('previous')}
        </button>
        <span aria-live="polite">{t('stepOf', { n: step + 1, total: letters.length })}</span>
        <button
          type="button"
          className="btn"
          disabled={step === letters.length - 1}
          onClick={() => setStep(step + 1)}
        >
          {t('next')} →
        </button>
      </div>
      <aside className="note">
        <strong>{t('teacherNote')}:</strong> {localize(lesson.teacherNote, lang)}
      </aside>
      <p className="hint">{t('keyboardHint')}</p>
    </div>
  );
}

function StudentMode({ lesson }: { lesson: Lesson }) {
  const { t, updateProgress } = useApp();
  const [round, setRound] = useState(1);
  const questions = useMemo(
    () => buildQuiz(lessonLetters(lesson), LETTERS, seededRandom(Date.now() + round)),
    [lesson, round],
  );
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);

  const finished = index >= questions.length;
  const score = scorePercent(correct, questions.length);

  useEffect(() => {
    if (finished) updateProgress((p) => recordQuizResult(p, lesson.id, score));
  }, [finished, lesson.id, score, updateProgress]);

  // Toetsen 1–4 kiezen een antwoord.
  useEffect(() => {
    if (finished || answer) return;
    const onKey = (event: KeyboardEvent) => {
      const option = questions[index].options[Number(event.key) - 1];
      if (!option) return;
      setAnswer(option.id);
      if (option.id === questions[index].letter.id) setCorrect((c) => c + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finished, answer, questions, index]);

  if (finished) {
    return (
      <div className="quiz">
        <p className="quiz-result" role="status">
          {t('quizDone', { score })}
        </p>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setRound(round + 1);
            setIndex(0);
            setCorrect(0);
            setAnswer(null);
          }}
        >
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  const question = questions[index];
  const choose = (id: string) => {
    if (answer) return;
    setAnswer(id);
    if (id === question.letter.id) setCorrect(correct + 1);
  };

  return (
    <div className="quiz">
      <p>{t('stepOf', { n: index + 1, total: questions.length })}</p>
      <p className="arabic huge" lang="ar" dir="rtl" data-testid="quiz-letter">
        {question.letter.char}
      </p>
      <p>{t('whichLetter')}</p>
      <div className="options">
        {question.options.map((option, i) => (
          <button
            key={option.id}
            type="button"
            className={`btn big ${
              answer ? (option.id === question.letter.id ? 'correct' : option.id === answer ? 'wrong' : '') : ''
            }`}
            onClick={() => choose(option.id)}
          >
            <kbd>{i + 1}</kbd> {option.name}
          </button>
        ))}
      </div>
      {answer && (
        <>
          <p role="status">
            {answer === question.letter.id ? t('correct') : t('wrong', { answer: question.letter.name })}
          </p>
          <button
            type="button"
            className="btn primary"
            autoFocus
            onClick={() => {
              setIndex(index + 1);
              setAnswer(null);
            }}
          >
            {t('next')} →
          </button>
        </>
      )}
    </div>
  );
}
