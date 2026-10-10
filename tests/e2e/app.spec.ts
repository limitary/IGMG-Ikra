import { _electron as electron, expect, test, type ElectronApplication, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import letters from '../../src/content/letters.json';

// Start de desktopapp zonder Vite-server en met een tijdelijk, apart profiel.
// IKRA_EXECUTABLE = pad naar een gebouwde app (bv. release/linux-unpacked/igmg-ikra
// of de AppImage). Zonder die variabele wordt de lokale build in dist/ gebruikt.
// --proxy-server naar een dode poort: elk netwerkverzoek dat toch zou ontsnappen, mislukt.

const ROOT = path.resolve(__dirname, '..', '..');
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ikra-e2e-profile-'));

async function launch(): Promise<{ app: ElectronApplication; page: Page }> {
  const args = ['--proxy-server=127.0.0.1:9', '--proxy-bypass-list=<-loopback>'];
  if (process.env.IKRA_TEST_NO_SANDBOX === '1') args.push('--no-sandbox');
  const executable = process.env.IKRA_EXECUTABLE;
  const app = await electron.launch({
    ...(executable ? { executablePath: executable, args } : { args: [ROOT, ...args] }),
    cwd: os.tmpdir(),
    env: {
      ...process.env,
      IKRA_USER_DATA_DIR: profileDir,
      APPIMAGE_EXTRACT_AND_RUN: '1',
      IKRA_RECORD_REQUESTS: '1',
    },
  });
  const page = await app.firstWindow();
  await page.waitForURL('app://ikra/index.html');
  return { app, page };
}

async function allRequests(app: ElectronApplication): Promise<string[]> {
  return app.evaluate(() => (globalThis as unknown as { __ikraAllRequests: string[] }).__ikraAllRequests);
}

function assertOnlyLocal(urls: string[], allowedBlocked: string[] = []) {
  expect(urls.length).toBeGreaterThan(2);
  const external = urls.filter((u) => !/^(app:\/\/ikra\/|data:|blob:|devtools:)/.test(u) && !allowedBlocked.includes(u));
  expect(external).toEqual([]);
}

async function blockedRequests(app: ElectronApplication): Promise<string[]> {
  return app.evaluate(() => (globalThis as unknown as { __ikraBlockedRequests: string[] }).__ikraBlockedRequests);
}

const nameOf = (char: string) => letters.find((l) => l.char === char)!.name;

test.describe.configure({ mode: 'serial' });

test.afterAll(() => fs.rmSync(profileDir, { recursive: true, force: true }));

test('koude start, alle kernflows en geen netwerk', async () => {
  const { app, page } = await launch();
  expect(page.url()).toBe('app://ikra/index.html');

  // Beveiliging: geen Node in de pagina, alleen de kleine ikra-brug.
  const env = await page.evaluate(() => ({
    require: typeof (window as unknown as { require?: unknown }).require,
    process: typeof (window as unknown as { process?: unknown }).process,
    bridge: Object.keys((window as unknown as { ikra: object }).ikra).sort(),
  }));
  expect(env).toEqual({ require: 'undefined', process: 'undefined', bridge: ['appInfo', 'readStore', 'writeStore'] });

  // Onboarding + taal
  await expect(page.getByRole('heading', { name: 'Welkom' })).toBeVisible();
  await page.getByRole('radio', { name: 'Türkçe' }).click();
  await expect(page.getByRole('heading', { name: 'Hoş geldiniz' })).toBeVisible();
  await page.getByRole('radio', { name: 'Nederlands' }).click();
  await page.getByRole('button', { name: 'Starten' }).click();
  await expect(page.getByText('0 van 3 lessen afgerond')).toBeVisible();

  // Arabisch lettertype is lokaal geladen
  const amiri = await page.evaluate(async () => {
    await document.fonts.load('40px Amiri', 'ب');
    return document.fonts.check('40px Amiri', 'ب');
  });
  expect(amiri).toBe(true);

  // Les in docentmodus met toetsenbord
  await page.getByRole('button', { name: 'Lessen' }).click();
  await page.getByRole('button', { name: /Les 1/ }).click();
  await expect(page.getByTestId('letter')).toHaveText('ا');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('letter')).toHaveText('ب');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('letter')).toHaveText('ا');
  await expect(page.getByText(/Notitie voor docent/)).toBeVisible();

  // Leerlingmodus: alles goed beantwoorden
  await page.getByRole('tab', { name: 'Leerlingmodus' }).click();
  for (let i = 0; i < 4; i++) {
    await expect(page.getByText(`${i + 1} van 4`, { exact: true })).toBeVisible();
    const char = (await page.getByTestId('quiz-letter').textContent())!.trim();
    await page.getByRole('button', { name: new RegExp(`^\\d ${nameOf(char)}$`) }).click();
    await expect(page.getByText('Goed!')).toBeVisible();
    await page.getByRole('button', { name: 'Volgende →' }).click();
  }
  await expect(page.getByText('Klaar! Je score: 100%')).toBeVisible();

  // Terug met Esc
  await page.keyboard.press('Escape');
  await expect(page.getByText(/Afgerond · Beste score: 100%/)).toBeVisible();
  await page.keyboard.press('Escape');

  // Luisteren: lokale audio speelt af, ontbrekende audio geeft nette melding
  await page.getByRole('button', { name: 'Luisteren' }).click();
  await page.getByRole('button', { name: '▶ Afspelen' }).click();
  await expect(page.getByTestId('audio-status')).toHaveText(/playing|idle/);
  await expect(page.getByTestId('audio-status')).not.toHaveText('error');
  // Snel wisselen tijdens afspelen mag geen foutmelding geven.
  await page.getByRole('button', { name: /Demofragment 2/ }).click();
  await page.getByRole('button', { name: '▶ Afspelen' }).click();
  await page.getByRole('button', { name: /Demofragment 3/ }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('Voor dit onderdeel is geen audiobestand beschikbaar.')).toBeVisible();
  await page.keyboard.press('Escape');

  // PDF: openen, bladeren, zoomen, tekenen
  await page.getByRole('button', { name: 'PDF-bibliotheek' }).click();
  await page.getByRole('button', { name: /Voorbeeld-lesboek/ }).click();
  await expect(page.getByTestId('pdf-page')).toHaveText('Pagina 1 / 3');
  await expect(page.locator('.pdf-page')).not.toHaveAttribute('data-rendered', '0');
  const inked = await page.getByTestId('pdf-canvas').evaluate((c: HTMLCanvasElement) => {
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let dark = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i] < 100) dark++;
    return dark;
  });
  expect(inked).toBeGreaterThan(500);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('pdf-page')).toHaveText('Pagina 2 / 3');
  await page.getByRole('button', { name: 'Inzoomen' }).click();
  await expect(page.getByTestId('pdf-zoom')).toHaveText('125%');
  await page.getByRole('radio', { name: 'Pen' }).click();
  const box = (await page.locator('.draw-layer').boundingBox())!;
  await page.mouse.move(box.x + 50, box.y + 50);
  await page.mouse.down();
  await page.mouse.move(box.x + 200, box.y + 120, { steps: 5 });
  await page.mouse.up();
  const drawn = await page.locator('.draw-layer').evaluate((c: HTMLCanvasElement) => {
    const data = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
    return n;
  });
  expect(drawn).toBeGreaterThan(50);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  // Instellingen: taal naar Duits, opslaglocatie in het testprofiel
  await page.getByRole('button', { name: 'Instellingen' }).click();
  await page.getByRole('radio', { name: 'Deutsch' }).click();
  await expect(page.getByRole('heading', { name: 'Einstellungen' })).toBeVisible();
  await expect(page.getByTestId('data-file')).toHaveText(path.join(profileDir, 'ikra-data.json'));

  // Een bewust extern verzoek moet geblokkeerd worden (door de CSP van de
  // pagina, en anders door de netwerkblokkade in het hoofdproces).
  const external = await page.evaluate(() =>
    fetch('https://example.com/test').then(
      () => 'gelukt',
      () => 'geblokkeerd',
    ),
  );
  expect(external).toBe('geblokkeerd');
  for (const url of await blockedRequests(app)) expect(url).toBe('https://example.com/test');
  assertOnlyLocal(await allRequests(app), ['https://example.com/test']);

  await app.close();
});

test('na herstart blijven taal en voortgang bewaard', async () => {
  const { app, page } = await launch();
  await expect(page.getByText('1 von 3 Lektionen abgeschlossen')).toBeVisible();
  await page.getByRole('button', { name: 'Lektionen' }).click();
  await expect(page.getByText(/Abgeschlossen · Beste Punktzahl: 100%/)).toBeVisible();
  expect(await blockedRequests(app)).toEqual([]);
  assertOnlyLocal(await allRequests(app));
  await app.close();

  const saved = JSON.parse(fs.readFileSync(path.join(profileDir, 'ikra-data.json'), 'utf8'));
  expect(saved.settings.language).toBe('de');
  expect(saved.progress.lessons['les-1'].bestScore).toBe(100);
});
