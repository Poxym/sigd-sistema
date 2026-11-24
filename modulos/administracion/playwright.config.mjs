import { defineConfig } from '@playwright/test';

// Red de seguridad visual del SIGD · Administración.
// Abre el sistema con Vite (puerto 4201), recorre las pantallas y compara capturas contra las guardadas.
export default defineConfig({
  testDir: './tests',
  // Las capturas de referencia se guardan junto a las pruebas, una carpeta por archivo de prueba
  snapshotPathTemplate: '{testDir}/capturas-base/{testFileName}/{arg}{ext}',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: {
      // 0 = idéntico pixel por pixel. Si algún día una fuente produce ruido mínimo, sube a 0.001
      maxDiffPixelRatio: 0,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL: 'http://localhost:4201',
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    // PW_CHANNEL=chrome usa el Chrome instalado en lugar del Chromium de Playwright
    channel: process.env.PW_CHANNEL || undefined,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4201',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
