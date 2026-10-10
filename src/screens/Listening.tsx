import { useState } from 'react';
import { useApp } from '../AppContext';
import { DemoBanner, Page } from '../components/Layout';
import { LISTENING, localize } from '../lib/content';
import { useAudio } from '../lib/useAudio';

const SPEEDS = [0.75, 1, 1.25];

export function Listening() {
  const { t, lang } = useApp();
  const [selectedId, setSelectedId] = useState(LISTENING[0]?.id);
  const item = LISTENING.find((i) => i.id === selectedId) ?? LISTENING[0];
  const audio = useAudio(item?.audio ?? null);

  return (
    <Page title={t('listening')}>
      {LISTENING.some((i) => i.demo) && <DemoBanner />}
      <div className="split">
        <ul className="side-list">
          {LISTENING.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className={`list-item ${entry.id === item?.id ? 'active' : ''}`}
                aria-current={entry.id === item?.id}
                onClick={() => setSelectedId(entry.id)}
              >
                {localize(entry.title, lang)}
              </button>
            </li>
          ))}
        </ul>
        {item && (
          <section className="reader">
            <h2>{localize(item.title, lang)}</h2>
            <div className="arabic-text" lang="ar" dir="rtl">
              {item.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {audio.status === 'missing' ? (
              <p className="info" role="status">
                {t('audioMissing')}
              </p>
            ) : (
              <div className="player">
                <button type="button" className="btn primary" onClick={audio.toggle}>
                  {audio.status === 'playing' ? t('pause') : `▶ ${t('play')}`}
                </button>
                <label className="checkbox">
                  <input type="checkbox" checked={audio.loop} onChange={(e) => audio.setLoop(e.target.checked)} />
                  {t('repeat')}
                </label>
                <label>
                  {t('speed')}{' '}
                  <select value={audio.rate} onChange={(e) => audio.setRate(Number(e.target.value))}>
                    {SPEEDS.map((s) => (
                      <option key={s} value={s}>
                        {s}×
                      </option>
                    ))}
                  </select>
                </label>
                <span hidden data-testid="audio-status">
                  {audio.status}
                </span>
              </div>
            )}
            {audio.status === 'error' && (
              <p className="warning" role="alert">
                {t('audioError')}
              </p>
            )}
          </section>
        )}
      </div>
    </Page>
  );
}
