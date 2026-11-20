import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas E2E del proyecto con Playwright.
 *
 * - Sin BASE_URL: levanta la app con `npm run dev` y prueba en http://localhost:3000.
 * - Con BASE_URL: prueba un sitio ya publicado, por ejemplo
 *   BASE_URL=https://jesuslandero24.github.io/barberia-mockup/ npm run test:e2e
 * - CHROME_PATH (opcional): ruta de un Chrome/Chromium instalado en el sistema.
 */
const rawBaseURL = process.env.BASE_URL ?? "http://localhost:3000/";
const baseURL = rawBaseURL.endsWith("/") ? rawBaseURL : `${rawBaseURL}/`;

export default defineConfig({
  testDir: "./tests/e2e",
  tsconfig: "./tests/tsconfig.json",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/resultados.json" }],
  ],
  use: {
    baseURL,
    locale: "es-CO",
    timezoneId: "America/Bogota",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {},
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
