import { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { Page } from '../components/Layout';
import { LANGUAGE_NAMES, LANGUAGES } from '../i18n';
import { ARABIC_SCALES } from '../lib/schema';
import { getAppInfo, isDesktop, type AppInfo } from '../lib/storage';

export function SettingsScreen() {
  const { t, settings, updateSettings } = useApp();
  const [info, setInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    getAppInfo()
      .then(setInfo)
      .catch(() => setInfo(null));
  }, []);

  return (
    <Page title={t('settings')}>
      <section className="settings">
        <h2>{t('language')}</h2>
        <div className="language-choice" role="radiogroup" aria-label={t('language')}>
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={settings.language === l}
              className={`btn ${settings.language === l ? 'primary' : ''}`}
              onClick={() => updateSettings({ language: l })}
            >
              {LANGUAGE_NAMES[l]}
            </button>
          ))}
        </div>

        <h2>{t('arabicSize')}</h2>
        <div className="language-choice" role="radiogroup" aria-label={t('arabicSize')}>
          {ARABIC_SCALES.map((scale) => (
            <button
              key={scale}
              type="button"
              role="radio"
              aria-checked={settings.arabicScale === scale}
              className={`btn ${settings.arabicScale === scale ? 'primary' : ''}`}
              onClick={() => updateSettings({ arabicScale: scale })}
            >
              {Math.round(scale * 100)}%
            </button>
          ))}
        </div>
        <p className="arabic big" lang="ar" dir="rtl">
          ا ب ت ث ج
        </p>

        <h2>{t('dataLocation')}</h2>
        <p>{t('dataLocal')}</p>
        {isDesktop() ? (
          info && <code className="path" data-testid="data-file">{info.dataFile}</code>
        ) : (
          <p>{t('browserStorage')}</p>
        )}
        <p className="offline-badge">{t('offlineBadge')}</p>
        {info && (
          <p className="hint">
            {t('version')} {info.version}
          </p>
        )}
      </section>
    </Page>
  );
}
