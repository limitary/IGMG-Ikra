import { useApp } from '../AppContext';
import { DemoBanner, Page } from '../components/Layout';
import { LESSONS, lessonLetters, localize } from '../lib/content';

export function LessonCatalog() {
  const { t, lang, navigate, progress } = useApp();
  return (
    <Page title={t('lessons')}>
      {LESSONS.some((l) => l.demo) && <DemoBanner />}
      <ul className="card-list">
        {LESSONS.map((lesson) => {
          const p = progress.lessons[lesson.id];
          return (
            <li key={lesson.id}>
              <button type="button" className="card" onClick={() => navigate({ name: 'lesson', id: lesson.id })}>
                <span className="card-title">{localize(lesson.title, lang)}</span>
                <span className="arabic" lang="ar" dir="rtl">
                  {lessonLetters(lesson)
                    .map((l) => l.char)
                    .join(' ')}
                </span>
                <span className={`status ${p?.completed ? 'done' : ''}`}>
                  {p?.completed ? `✓ ${t('completed')} · ${t('bestScore')}: ${p.bestScore}%` : t('notStarted')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
