import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext, parentRoute, type AppState, type Route } from './AppContext';
import { translate, type TextKey } from './i18n';
import { DEFAULT_SETTINGS, EMPTY_PROGRESS, type Progress, type Settings } from './lib/schema';
import { loadAll, save } from './lib/storage';
import { Dashboard } from './screens/Dashboard';
import { LessonCatalog } from './screens/LessonCatalog';
import { LessonView } from './screens/LessonView';
import { Listening } from './screens/Listening';
import { Onboarding } from './screens/Onboarding';
import { PdfLibrary } from './screens/PdfLibrary';
import { PdfViewer } from './screens/PdfViewer';
import { SettingsScreen } from './screens/Settings';

export function App() {
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const [saveFailed, setSaveFailed] = useState(false);
  const routeRef = useRef(route);
  routeRef.current = route;

  useEffect(() => {
    loadAll()
      .then((data) => {
        setSettings(data.settings);
        setProgress(data.progress);
      })
      .catch((error: unknown) => console.error('Laden mislukt', error))
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback((key: 'settings' | 'progress', value: Settings | Progress) => {
    save(key, value)
      .then(() => setSaveFailed(false))
      .catch((error: unknown) => {
        console.error('Opslaan mislukt', error);
        setSaveFailed(true);
      });
  }, []);

  const updateSettings = useCallback(
    (change: Partial<Settings>) => {
      setSettings((previous) => {
        const next = { ...previous, ...change };
        persist('settings', next);
        return next;
      });
    },
    [persist],
  );

  const updateProgress = useCallback(
    (update: (previous: Progress) => Progress) => {
      setProgress((previous) => {
        const next = update(previous);
        if (next !== previous) persist('progress', next);
        return next;
      });
    },
    [persist],
  );

  const goBack = useCallback(() => {
    const parent = parentRoute(routeRef.current);
    if (parent) setRoute(parent);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
      if (event.key === 'Escape') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBack]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.style.setProperty('--arabic-scale', String(settings.arabicScale));
  }, [settings.language, settings.arabicScale]);

  const state: AppState = useMemo(
    () => ({
      lang: settings.language,
      t: (key: TextKey, vars?: Record<string, string | number>) => translate(settings.language, key, vars),
      settings,
      progress,
      updateSettings,
      updateProgress,
      navigate: setRoute,
      goBack,
    }),
    [settings, progress, updateSettings, updateProgress, goBack],
  );

  if (!loaded) return <div className="loading">…</div>;

  return (
    <AppContext.Provider value={state}>
      {saveFailed && (
        <div className="save-error" role="alert">
          {state.t('saveError')}
        </div>
      )}
      {!settings.onboarded ? <Onboarding /> : <Screen route={route} />}
    </AppContext.Provider>
  );
}

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'dashboard':
      return <Dashboard />;
    case 'lessons':
      return <LessonCatalog />;
    case 'lesson':
      return <LessonView key={route.id} lessonId={route.id} />;
    case 'listening':
      return <Listening />;
    case 'pdfs':
      return <PdfLibrary />;
    case 'pdf':
      return <PdfViewer key={route.id} pdfId={route.id} />;
    case 'settings':
      return <SettingsScreen />;
  }
}
