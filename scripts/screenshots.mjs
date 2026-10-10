// Maakt schermafbeeldingen van de gebouwde app (voor README). Gebruik:
//   xvfb-run -a node scripts/screenshots.mjs
import { _electron as electron } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const profile = mkdtempSync(join(tmpdir(), 'ikra-shots-'));
const args = ['.'];
if (process.env.IKRA_TEST_NO_SANDBOX === '1') args.push('--no-sandbox');
const app = await electron.launch({ args, env: { ...process.env, IKRA_USER_DATA_DIR: profile } });
const page = await app.firstWindow();
await page.setViewportSize({ width: 1280, height: 800 });
await page.waitForURL('app://ikra/index.html');
const shot = (name) => page.screenshot({ path: `docs/screenshots/${name}.png` });

await page.getByRole('button', { name: 'Starten' }).waitFor();
await shot('1-start');
await page.getByRole('button', { name: 'Starten' }).click();
await shot('2-dashboard');
await page.getByRole('button', { name: 'Lessen' }).click();
await page.getByRole('button', { name: /Les 1/ }).click();
await shot('3-les-docent');
await page.getByRole('tab', { name: 'Leerlingmodus' }).click();
await shot('4-les-leerling');
await page.getByRole('button', { name: 'Start' }).click();
await page.getByRole('button', { name: 'Luisteren' }).click();
await shot('5-luisteren');
await page.getByRole('button', { name: 'Start' }).click();
await page.getByRole('button', { name: 'PDF-bibliotheek' }).click();
await page.getByRole('button', { name: /Voorbeeld-lesboek/ }).click();
await page.locator('.pdf-page:not([data-rendered="0"])').waitFor();
await shot('6-pdf');
await app.close();
rmSync(profile, { recursive: true, force: true });
