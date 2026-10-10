import { useApp, type Route } from '../AppContext';
import type { TextKey } from '../i18n';
import { LESSONS } from '../lib/content';

const TILES: { key: TextKey; route: Route; icon: string }[] = [
  { key: 'lessons', route: { name: 'lessons' }, icon: 'ا' },
  { key: 'listening', route: { name: 'listening' }, icon: '♪' },
  { key: 'pdfLibrary', route: { name: 'pdfs' }, icon: '▤' },
  { key: 'settings', route: { name: 'settings' }, icon: '⚙' },
];

export function Dashboard() {
  const { t, navigate, progress } = useApp();
  const done = LESSONS.filter((l) => progress.lessons[l.id]?.completed).length;
  return (
    <div className="page">
      <header className="topbar">
        <h1 className="brand">{t('appName')}</h1>
        <span className="offline-badge">{t('offlineBadge')}</span>
      </header>
      <main className="content">
        <p className="summary">{t('progressSummary', { done, total: LESSONS.length })}</p>
        <nav className="tiles">
          {TILES.map((tile) => (
            <button key={tile.key} type="button" className="tile" onClick={() => navigate(tile.route)}>
              <span className="tile-icon" aria-hidden="true">
                {tile.icon}
              </span>
              <span>{t(tile.key)}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
