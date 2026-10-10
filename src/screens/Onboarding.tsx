import { useApp } from '../AppContext';
import { LANGUAGE_NAMES, LANGUAGES, translate } from '../i18n';

export function Onboarding() {
  const { settings, updateSettings } = useApp();
  const lang = settings.language;
  return (
    <div className="onboarding">
      <h1 className="brand">IGMG İkra</h1>
      <p className="arabic big" lang="ar" dir="rtl">
        ا ب ت
      </p>
      <h2>{translate(lang, 'welcome')}</h2>
      <p>{LANGUAGES.map((l) => translate(l, 'chooseLanguage')).join(' · ')}</p>
      <div className="language-choice" role="radiogroup" aria-label={translate(lang, 'language')}>
        {LANGUAGES.map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={lang === l}
            className={`btn big ${lang === l ? 'primary' : ''}`}
            onClick={() => updateSettings({ language: l })}
          >
            {LANGUAGE_NAMES[l]}
          </button>
        ))}
      </div>
      <button type="button" className="btn primary big" onClick={() => updateSettings({ onboarded: true })}>
        {translate(lang, 'start')}
      </button>
      <p className="offline-badge">{translate(lang, 'offlineBadge')}</p>
    </div>
  );
}
