This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Pruebas E2E con Playwright

La carpeta `tests/e2e` contiene 65 casos de prueba automatizados. Cada test lleva en su título el ID del caso (por ejemplo `CP-RES-001`), el mismo que aparece en `Casos_de_Prueba_Barberia.xlsx` y en el Plan de pruebas.

```bash
npm install
npx playwright install chromium   # solo la primera vez
npm run test:e2e                  # levanta `npm run dev` y ejecuta la suite
npm run test:e2e:report           # abre el reporte HTML
```

Para probar el sitio publicado en GitHub Pages:

```bash
BASE_URL=https://jesuslandero24.github.io/barberia-mockup/ npm run test:e2e
```

- Las pruebas fijan el reloj en el miércoles 18 de noviembre de 2026 a las 8:00 a. m. (hora de Bogotá), para que la disponibilidad sea reproducible.
- Cada test usa un navegador limpio, así que arranca con los datos de ejemplo; algunos casos cargan su propio estado en `localStorage`.
- Nueve casos fallan a propósito porque documentan defectos abiertos (DEF-001 a DEF-009 del reporte de defectos). Cuando se corrija un defecto, su prueba debe pasar.
- En GitHub Actions, el job `e2e` corre antes del build y publica el reporte como artefacto; sus fallos no detienen el despliegue.
