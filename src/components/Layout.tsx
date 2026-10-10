import type { ReactNode } from 'react';
import { useApp } from '../AppContext';

export function Page({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  const { t, goBack, navigate } = useApp();
  return (
    <div className="page">
      <header className="topbar">
        <button type="button" className="btn ghost" onClick={goBack} aria-label={t('back')}>
          ← {t('back')}
        </button>
        <h1>{title}</h1>
        <div className="topbar-actions">
          {actions}
          <button type="button" className="btn ghost" onClick={() => navigate({ name: 'dashboard' })}>
            {t('home')}
          </button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

export function DemoBanner() {
  const { t } = useApp();
  return (
    <p className="demo-banner" role="note">
      {t('demoBanner')}
    </p>
  );
}
