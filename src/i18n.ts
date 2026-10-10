export const LANGUAGES = ['tr', 'nl', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];
export type Localized = Record<Language, string>;

export const LANGUAGE_NAMES: Localized = { tr: 'Türkçe', nl: 'Nederlands', de: 'Deutsch' };

const dict = {
  appName: { tr: 'IGMG İkra', nl: 'IGMG İkra', de: 'IGMG İkra' },
  welcome: { tr: 'Hoş geldiniz', nl: 'Welkom', de: 'Willkommen' },
  chooseLanguage: { tr: 'Dilinizi seçin', nl: 'Kies uw taal', de: 'Wählen Sie Ihre Sprache' },
  start: { tr: 'Başla', nl: 'Starten', de: 'Starten' },
  back: { tr: 'Geri', nl: 'Terug', de: 'Zurück' },
  home: { tr: 'Ana sayfa', nl: 'Start', de: 'Startseite' },
  lessons: { tr: 'Dersler', nl: 'Lessen', de: 'Lektionen' },
  listening: { tr: 'Dinleme', nl: 'Luisteren', de: 'Hören' },
  pdfLibrary: { tr: 'PDF kütüphanesi', nl: 'PDF-bibliotheek', de: 'PDF-Bibliothek' },
  settings: { tr: 'Ayarlar', nl: 'Instellingen', de: 'Einstellungen' },
  offlineBadge: {
    tr: 'Çevrimdışı çalışır – internet gerekmez',
    nl: 'Werkt offline – geen internet nodig',
    de: 'Funktioniert offline – kein Internet nötig',
  },
  demoBanner: {
    tr: 'ÖRNEK İÇERİK – onaylı IGMG içeriği ile değiştirilmelidir',
    nl: 'DEMO-INHOUD – moet vervangen worden door goedgekeurde IGMG-inhoud',
    de: 'DEMO-INHALT – muss durch freigegebene IGMG-Inhalte ersetzt werden',
  },
  progressSummary: {
    tr: '{done} / {total} ders tamamlandı',
    nl: '{done} van {total} lessen afgerond',
    de: '{done} von {total} Lektionen abgeschlossen',
  },
  completed: { tr: 'Tamamlandı', nl: 'Afgerond', de: 'Abgeschlossen' },
  notStarted: { tr: 'Başlanmadı', nl: 'Nog niet gestart', de: 'Nicht begonnen' },
  bestScore: { tr: 'En iyi puan', nl: 'Beste score', de: 'Beste Punktzahl' },
  teacherMode: { tr: 'Öğretmen modu', nl: 'Docentmodus', de: 'Lehrermodus' },
  studentMode: { tr: 'Öğrenci modu', nl: 'Leerlingmodus', de: 'Schülermodus' },
  teacherNote: { tr: 'Öğretmen notu', nl: 'Notitie voor docent', de: 'Hinweis für Lehrkräfte' },
  previous: { tr: 'Önceki', nl: 'Vorige', de: 'Zurück' },
  next: { tr: 'Sonraki', nl: 'Volgende', de: 'Weiter' },
  play: { tr: 'Dinle', nl: 'Afspelen', de: 'Abspielen' },
  pause: { tr: 'Duraklat', nl: 'Pauze', de: 'Pause' },
  repeat: { tr: 'Tekrarla', nl: 'Herhalen', de: 'Wiederholen' },
  speed: { tr: 'Hız', nl: 'Snelheid', de: 'Tempo' },
  stepOf: { tr: '{n} / {total}', nl: '{n} van {total}', de: '{n} von {total}' },
  keyboardHint: {
    tr: 'Klavye: ← → gezin, Boşluk = dinle, Esc = geri',
    nl: 'Toetsenbord: ← → bladeren, spatie = afspelen, Esc = terug',
    de: 'Tastatur: ← → blättern, Leertaste = abspielen, Esc = zurück',
  },
  whichLetter: { tr: 'Bu hangi harf?', nl: 'Welke letter is dit?', de: 'Welcher Buchstabe ist das?' },
  correct: { tr: 'Doğru!', nl: 'Goed!', de: 'Richtig!' },
  wrong: { tr: 'Yanlış. Doğrusu: {answer}', nl: 'Helaas. Het juiste antwoord: {answer}', de: 'Leider falsch. Richtig: {answer}' },
  quizDone: { tr: 'Bitti! Puanınız: {score}%', nl: 'Klaar! Je score: {score}%', de: 'Fertig! Deine Punktzahl: {score}%' },
  tryAgain: { tr: 'Tekrar dene', nl: 'Opnieuw', de: 'Nochmal' },
  audioMissing: {
    tr: 'Bu bölüm için ses dosyası yok.',
    nl: 'Voor dit onderdeel is geen audiobestand beschikbaar.',
    de: 'Für diesen Abschnitt ist keine Audiodatei vorhanden.',
  },
  audioError: {
    tr: 'Ses dosyası açılamadı. Uygulamanın geri kalanı normal çalışır.',
    nl: 'Het audiobestand kon niet worden geopend. De rest van de app werkt gewoon.',
    de: 'Die Audiodatei konnte nicht geöffnet werden. Der Rest der App funktioniert normal.',
  },
  pdfError: {
    tr: 'PDF açılamadı. Dosya eksik veya bozuk olabilir.',
    nl: 'De PDF kon niet worden geopend. Het bestand ontbreekt of is beschadigd.',
    de: 'Die PDF konnte nicht geöffnet werden. Die Datei fehlt oder ist beschädigt.',
  },
  loading: { tr: 'Yükleniyor…', nl: 'Laden…', de: 'Wird geladen…' },
  page: { tr: 'Sayfa', nl: 'Pagina', de: 'Seite' },
  zoomIn: { tr: 'Yakınlaştır', nl: 'Inzoomen', de: 'Vergrößern' },
  zoomOut: { tr: 'Uzaklaştır', nl: 'Uitzoomen', de: 'Verkleinern' },
  pen: { tr: 'Kalem', nl: 'Pen', de: 'Stift' },
  highlighter: { tr: 'Fosforlu kalem', nl: 'Markeerstift', de: 'Textmarker' },
  noTool: { tr: 'Çizim kapalı', nl: 'Tekenen uit', de: 'Zeichnen aus' },
  clearDrawing: { tr: 'Çizimi sil', nl: 'Tekening wissen', de: 'Zeichnung löschen' },
  drawingHint: {
    tr: 'Çizimler kaydedilmez; sayfadan çıkınca silinir.',
    nl: 'Tekeningen worden niet bewaard; ze verdwijnen bij het sluiten.',
    de: 'Zeichnungen werden nicht gespeichert; sie verschwinden beim Schließen.',
  },
  language: { tr: 'Dil', nl: 'Taal', de: 'Sprache' },
  arabicSize: { tr: 'Arapça yazı boyutu', nl: 'Grootte Arabische tekst', de: 'Größe arabischer Text' },
  dataLocation: { tr: 'Verilerin kaydedildiği yer', nl: 'Waar uw gegevens staan', de: 'Speicherort Ihrer Daten' },
  dataLocal: {
    tr: 'Ayarlar ve ilerleme yalnızca bu bilgisayarda saklanır. Hiçbir veri gönderilmez.',
    nl: 'Instellingen en voortgang worden alleen op deze computer bewaard. Er wordt niets verstuurd.',
    de: 'Einstellungen und Fortschritt werden nur auf diesem Computer gespeichert. Es wird nichts gesendet.',
  },
  browserStorage: {
    tr: 'Tarayıcı önizlemesi: veriler tarayıcıda saklanır.',
    nl: 'Browservoorbeeld: gegevens staan in de browser.',
    de: 'Browser-Vorschau: Daten werden im Browser gespeichert.',
  },
  version: { tr: 'Sürüm', nl: 'Versie', de: 'Version' },
  saveError: {
    tr: 'Kaydetme başarısız oldu. Değişiklikler kaybolabilir.',
    nl: 'Opslaan is mislukt. Wijzigingen kunnen verloren gaan.',
    de: 'Speichern fehlgeschlagen. Änderungen können verloren gehen.',
  },
} satisfies Record<string, Localized>;

export type TextKey = keyof typeof dict;

export function translate(lang: Language, key: TextKey, vars: Record<string, string | number> = {}): string {
  let text: string = dict[key][lang] ?? dict[key].nl;
  for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

export const ALL_TEXTS = dict;
