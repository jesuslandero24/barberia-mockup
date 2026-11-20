import { test as base, expect, type Page } from "@playwright/test";

/** Claves de la capa de datos (src/lib/db.ts). */
export const STORAGE_KEY = "yonder-barberia-db-v2";
export const SEED_FLAG = "yb-seeded-v2";

/**
 * Las pruebas usan un reloj fijo para que "hoy" y la disponibilidad sean
 * reproducibles: miércoles 18 de noviembre de 2026, 8:00 a. m. (Bogotá).
 */
export const HOY = "2026-11-18";
export const AHORA = "2026-11-18T08:00:00-05:00";

export type Cliente = { id: string; name: string; phone: string; email: string };
export type Cita = {
  id: string;
  code: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  createdAt: string;
  status: "active" | "cancelled";
};
export type Bloqueo = { id: string; barberId: string; date: string; time: string };
export type Db = { clients: Cliente[]; bookings: Cita[]; blockedSlots: Bloqueo[] };

/** Clientes de ejemplo que siembra la aplicación. */
export const CARLOS: Cliente = {
  id: "cliente-carlos",
  name: "Carlos Pérez",
  phone: "3001234567",
  email: "carlos@example.com",
};
export const ANDRES: Cliente = {
  id: "cliente-andres",
  name: "Andrés Gómez",
  phone: "3109876543",
  email: "andres@example.com",
};
export const LAURA: Cliente = {
  id: "cliente-laura",
  name: "Laura Restrepo",
  phone: "3128979997",
  email: "laura@example.com",
};

export const test = base.extend<{ ahora: string }>({
  ahora: [AHORA, { option: true }],
  page: async ({ page, ahora }, use) => {
    await page.clock.setFixedTime(new Date(ahora));
    await use(page);
  },
});

export { expect };

/** Fecha ISO a partir de HOY (0 = hoy, 1 = mañana...). */
export function dia(offset: number): string {
  return new Date(Date.UTC(2026, 10, 18 + offset)).toISOString().slice(0, 10);
}

/** Etiqueta larga de una fecha, igual a formatLongDate de la app. */
export function etiquetaDia(fecha: string): string {
  const texto = new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date(`${fecha}T12:00:00.000Z`))
    .replace(",", "");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function cita(
  datos: Pick<Cita, "date" | "time" | "serviceId"> & Partial<Cita>,
): Cita {
  return {
    id: `qa-${datos.date}-${datos.time}-${datos.serviceId}`,
    code: "YB-9000",
    clientId: CARLOS.id,
    barberId: "yonder",
    createdAt: "2026-11-17T12:00:00.000Z",
    status: "active",
    ...datos,
  };
}

export function bloqueo(date: string, time: string): Bloqueo {
  return { id: `qa-bloqueo-${date}-${time}`, barberId: "yonder", date, time };
}

export function dbBase(extra: Partial<Db> = {}): Db {
  return {
    clients: [CARLOS, ANDRES, LAURA],
    bookings: [],
    blockedSlots: [],
    ...extra,
  };
}

/**
 * Deja la base local en un estado conocido antes de cargar la página.
 * Con `null` se simula una base borrada (sin datos de ejemplo).
 * Solo se aplica una vez por pestaña para que las recargas conserven los cambios.
 */
export async function sembrar(
  page: Page,
  db: Db | null,
  extra: Record<string, string> = {},
): Promise<void> {
  await page.addInitScript(
    ({ key, flag, db, extra }) => {
      if (window.sessionStorage.getItem("__qa_sembrado")) return;
      window.sessionStorage.setItem("__qa_sembrado", "1");
      if (db === null) {
        window.localStorage.removeItem(key);
        window.localStorage.setItem(flag, "true");
      } else {
        window.localStorage.setItem(key, JSON.stringify(db));
      }
      for (const [clave, valor] of Object.entries(extra)) {
        window.localStorage.setItem(clave, valor);
      }
    },
    { key: STORAGE_KEY, flag: SEED_FLAG, db, extra },
  );
}

export async function leerDb(page: Page): Promise<Db> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw
      ? JSON.parse(raw)
      : { clients: [], bookings: [], blockedSlots: [] };
  }, STORAGE_KEY);
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- Flujo de reserva ----------

/** Mensajes de validación (excluye el anunciador de rutas de Next.js). */
export function alertas(page: Page) {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)');
}

export async function abrirReserva(page: Page, ruta = "reservar/"): Promise<void> {
  await page.goto(ruta);
  await expect(page.getByRole("heading", { name: "¿Qué te vas a hacer?" })).toBeVisible();
}

export function botonServicio(page: Page, nombre: string) {
  return page.getByRole("button", {
    name: new RegExp(`^${escaparRegex(nombre)} \\d+ min`),
  });
}

export async function elegirServicio(page: Page, nombre: string): Promise<void> {
  await botonServicio(page, nombre).click();
}

export async function continuar(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Continuar" }).click();
}

export function botonDia(page: Page, fecha: string) {
  return page.getByRole("button", { name: etiquetaDia(fecha), exact: true });
}

export async function elegirDia(page: Page, fecha: string): Promise<void> {
  await botonDia(page, fecha).click();
}

export function botonHora(page: Page, hora: string) {
  return page.getByRole("button", { name: hora, exact: true });
}

/** Textos de las horas disponibles que se muestran para el día elegido. */
export async function horasVisibles(page: Page): Promise<string[]> {
  const textos = await page.locator("button.time-slot").allTextContents();
  return textos.map((texto) => texto.replace(/\s+/g, " ").trim());
}

/** Lleva el flujo hasta el paso "Tus datos". */
export async function irADatos(
  page: Page,
  servicio: string,
  fecha: string,
  hora: string,
): Promise<void> {
  await abrirReserva(page);
  await elegirServicio(page, servicio);
  await continuar(page);
  await elegirDia(page, fecha);
  await botonHora(page, hora).click();
  await continuar(page);
  await expect(page.getByLabel("Celular o correo")).toBeVisible();
}

export async function buscarCliente(page: Page, identificador: string): Promise<void> {
  await page.getByLabel("Celular o correo").fill(identificador);
  await page.getByRole("button", { name: "Buscar" }).click();
}

export async function registrar(
  page: Page,
  datos: { nombre: string; celular?: string; correo?: string },
): Promise<void> {
  await expect(page.getByText("Regístrate para confirmar")).toBeVisible();
  await page.getByLabel("Nombre completo").fill(datos.nombre);
  if (datos.celular !== undefined) await page.getByLabel("Celular", { exact: true }).fill(datos.celular);
  if (datos.correo !== undefined) await page.getByLabel("Correo", { exact: true }).fill(datos.correo);
  await page.getByRole("button", { name: "Registrarme y confirmar" }).click();
}

/** Reserva completa con un cliente nuevo. */
export async function reservarComoNuevo(
  page: Page,
  datos: {
    servicio: string;
    fecha: string;
    hora: string;
    nombre: string;
    celular: string;
    correo: string;
  },
): Promise<void> {
  await irADatos(page, datos.servicio, datos.fecha, datos.hora);
  await buscarCliente(page, datos.celular);
  await registrar(page, { nombre: datos.nombre, correo: datos.correo });
  await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toBeVisible();
}

// ---------- Bot de WhatsApp ----------

export async function abrirBot(page: Page): Promise<void> {
  await page.goto("bot/");
  await expect(mensajesBot(page)).toHaveCount(2);
  await esperarBot(page);
}

export function mensajesBot(page: Page) {
  return page.locator('[role="log"] .justify-start p.whitespace-pre-line');
}

export async function esperarBot(page: Page): Promise<void> {
  const enLinea = page.getByText("en línea", { exact: true });
  await expect(enLinea).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(200);
  await expect(enLinea).toBeVisible({ timeout: 15_000 });
}

export async function enviarBot(page: Page, texto: string): Promise<void> {
  const entrada = page.getByRole("textbox", { name: "Escribe un mensaje" });
  await entrada.fill(texto);
  await entrada.press("Enter");
  await page.waitForTimeout(150);
  await esperarBot(page);
}

export async function ultimoMensajeBot(page: Page): Promise<string> {
  return (await mensajesBot(page).last().textContent()) ?? "";
}

export async function conversacionBot(page: Page): Promise<string> {
  return (await mensajesBot(page).allTextContents()).join("\n");
}

/** Recorre el bot hasta la pregunta del nombre: Agendar → servicio → día → hora. */
export async function botHastaNombre(
  page: Page,
  opciones = { servicio: "1", dia: "2", hora: "1" },
): Promise<void> {
  await enviarBot(page, "1");
  await enviarBot(page, opciones.servicio);
  await enviarBot(page, opciones.dia);
  await enviarBot(page, opciones.hora);
  await expect(mensajesBot(page).last()).toContainText("escribe tu nombre completo");
}

// ---------- Utilidades generales ----------

export async function abrirMenuDemo(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Demo" }).click();
}

export async function sinDesbordeHorizontal(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
}
