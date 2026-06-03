#!/usr/bin/env node
// Capture popup.html screenshots in every locale the extension ships.
//
// Usage:
//   node scripts/popup-screenshots.mjs           # all locales in src/_locales
//   node scripts/popup-screenshots.mjs en de fa  # subset
//
// Output: screenshots/popup-<locale>.png
//
// Implementation note: we do NOT use --load-extension because Chrome 137+
// stable disables it. Instead we serve dist/popup.html via file://, inject a
// mock `chrome` API per locale (only the bits popup.ts touches at load), and
// screenshot the rendered popup. Behavior isn't tested — only appearance —
// which is what the screenshots are for.

import { mkdir, readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SRC_LOCALES = join(ROOT, 'src', '_locales');
const SHOTS = join(ROOT, 'screenshots');

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

function findChrome() {
  for (const p of CHROME_PATHS) if (existsSync(p)) return p;
  throw new Error('Chrome not found. Install Google Chrome or edit CHROME_PATHS.');
}

async function listLocales() {
  const entries = await readdir(SRC_LOCALES, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

async function loadMessages(locale) {
  const path = join(SRC_LOCALES, locale, 'messages.json');
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return {};
  }
}

async function screenshotPopup(browser, locale) {
  const messages = await loadMessages(locale);
  // English is the default_locale — popup.ts uses it as the fallback for any
  // key missing from the requested locale, so layer English under the target.
  const fallback = locale === 'en' ? {} : await loadMessages('en');

  const page = await browser.newPage();
  await page.setViewport({ width: 380, height: 720, deviceScaleFactor: 2 });

  await page.evaluateOnNewDocument(
    ({ messages, fallback, locale }) => {
      const resolveMessage = (key, subs) => {
        const entry = messages[key] || fallback[key];
        if (!entry) return '';
        let msg = entry.message ?? '';
        if (Array.isArray(subs)) {
          for (let i = 0; i < subs.length; i++) msg = msg.split(`$${i + 1}`).join(String(subs[i]));
        }
        return msg;
      };
      const noop = () => {};
      const chromeStub = {
        i18n: {
          getMessage: (key, subs) => resolveMessage(key, subs),
          getUILanguage: () => locale,
          getAcceptLanguages: (cb) => cb([locale]),
        },
        runtime: {
          getURL: (p) => p,
          sendMessage: noop,
          onMessage: { addListener: noop },
          lastError: undefined,
          id: 'screenshot-stub',
        },
        storage: {
          local: {
            get: (_keys, cb) => { if (cb) cb({}); return Promise.resolve({}); },
            set: (_v, cb) => { if (cb) cb(); return Promise.resolve(); },
          },
          onChanged: { addListener: noop },
        },
        tabs: {
          query: (_opts, cb) => { if (cb) cb([]); return Promise.resolve([]); },
          sendMessage: noop,
          create: noop,
        },
        contextMenus: { create: noop, removeAll: (cb) => cb && cb() },
      };
      Object.defineProperty(window, 'chrome', { value: chromeStub, writable: false });
    },
    { messages, fallback, locale },
  );

  await page.goto(`file://${join(DIST, 'popup.html')}`, { waitUntil: 'networkidle0' });
  // Allow i18n DOM passes to finish.
  await new Promise((r) => setTimeout(r, 300));

  const out = join(SHOTS, `popup-${locale}.png`);
  await page.screenshot({ path: out, fullPage: true });
  await page.close();
  console.log(`✓ ${locale} → ${out}`);
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ missing — run `npm run build` first.');
    process.exit(1);
  }
  await mkdir(SHOTS, { recursive: true });

  const requested = process.argv.slice(2);
  const locales = requested.length > 0 ? requested : await listLocales();

  console.log(`Capturing ${locales.length} locale(s): ${locales.join(', ')}`);

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: 'new',
    defaultViewport: null,
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  try {
    for (const locale of locales) {
      try {
        await screenshotPopup(browser, locale);
      } catch (err) {
        console.error(`✗ ${locale}: ${err.message}`);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
