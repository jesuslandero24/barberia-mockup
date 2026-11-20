import type { Page } from "@playwright/test";
import {
  ANDRES,
  CARLOS,
  LAURA,
  abrirReserva,
  bloqueo,
  botonDia,
  cita,
  continuar,
  dbBase,
  dia,
  elegirDia,
  elegirServicio,
  expect,
  horasVisibles,
  leerDb,
  sembrar,
  test,
} from "./support/app";

async function abrirPanelEn(page: Page, fecha: string): Promise<void> {
  await page.goto("panel/");
  await expect(page.getByRole("heading", { name: "Agenda del día" })).toBeVisible();
  await botonDia(page, fecha).click();
  await expect(botonDia(page, fecha)).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Cargando agenda…")).toHaveCount(0);
}

function resumen(page: Page, etiqueta: string) {
  return page.getByText(etiqueta, { exact: true }).locator("..");
}

test.describe("Panel del barbero", () => {
  test("CP-PAN-001: Filtrado de citas activas por día y barbero", async ({ page }) => {
    await sembrar(
      page,
      dbBase({
        bookings: [
          cita({ date: dia(1), time: "09:00", serviceId: "corte", clientId: CARLOS.id }),
          cita({ date: dia(1), time: "10:00", serviceId: "corte", clientId: ANDRES.id, status: "cancelled" }),
          cita({ date: dia(1), time: "11:00", serviceId: "corte", clientId: LAURA.id, barberId: "otro-barbero" }),
          cita({ date: dia(2), time: "09:00", serviceId: "barba", clientId: LAURA.id }),
        ],
      }),
    );

    await abrirPanelEn(page, dia(1));
    await expect(page.getByText(CARLOS.name)).toBeVisible();
    await expect(page.getByText(ANDRES.name)).toHaveCount(0);
    await expect(page.getByText(LAURA.name)).toHaveCount(0);

    await abrirPanelEn(page, dia(2));
    await expect(page.getByText(LAURA.name)).toBeVisible();
    await expect(page.getByText(CARLOS.name)).toHaveCount(0);
  });

  test("CP-PAN-002: Estados de los bloques en la línea de tiempo", async ({ page }) => {
    await sembrar(
      page,
      dbBase({
        bookings: [cita({ date: dia(1), time: "09:00", serviceId: "corte-barba", clientId: CARLOS.id })],
        blockedSlots: [bloqueo(dia(1), "10:30")],
      }),
    );
    await abrirPanelEn(page, dia(1));

    await expect(page.getByText(CARLOS.name)).toBeVisible();
    await expect(page.getByText("Ocupado · continúa Corte + barba")).toHaveCount(1);
    await expect(page.getByText("Bloqueado", { exact: true })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Quitar bloqueo" })).toHaveCount(1);
    // 18 bloques del día: 1 cita, 1 continuación, 1 bloqueo y 15 libres.
    await expect(page.getByText("Libre", { exact: true })).toHaveCount(15);
  });

  test("CP-PAN-003: Bloquear una hora en el panel la oculta en la reserva", async ({ page }) => {
    await abrirPanelEn(page, dia(1));
    await page.getByRole("button", { name: "Bloquear" }).first().click();
    await expect(page.getByRole("button", { name: "Quitar bloqueo" })).toHaveCount(1);
    const db = await leerDb(page);
    expect(db.blockedSlots).toEqual([expect.objectContaining({ date: dia(1), time: "09:00" })]);

    await abrirReserva(page);
    await elegirServicio(page, "Corte");
    await continuar(page);
    await elegirDia(page, dia(1));
    expect(await horasVisibles(page)).not.toContain("9:00 a. m.");
  });

  test("CP-PAN-004: Cancelar una cita en el panel pide confirmación", async ({ page }) => {
    await abrirPanelEn(page, dia(2));
    await expect(resumen(page, "Citas")).toContainText("2");

    await page.getByRole("button", { name: "Cancelar cita" }).first().click();
    await expect(page.getByText("¿Cancelar esta cita?")).toBeVisible();
    await page.getByRole("button", { name: "Sí, cancelar" }).click();

    await expect(page.getByText(LAURA.name)).toHaveCount(0);
    await expect(resumen(page, "Citas")).toContainText("1");
    const db = await leerDb(page);
    expect(db.bookings.find((item) => item.id === "seed-yonder-2")?.status).toBe("cancelled");
  });

  test("CP-PAN-005: Horas libres con coma decimal (formato es-CO)", async ({ page }) => {
    await abrirPanelEn(page, dia(1));
    await expect(resumen(page, "Horas libres")).toContainText("7 h");
    await page.getByRole("button", { name: "Bloquear" }).first().click();

    // Esperado en español de Colombia: "6,5 h".
    await expect(resumen(page, "Horas libres")).toContainText("6,5 h");
  });

  test("CP-PAN-006: Resumen del día con citas e ingresos estimados", async ({ page }) => {
    await abrirPanelEn(page, dia(1));
    await expect(resumen(page, "Citas")).toContainText("2");
    await expect(resumen(page, "Horas libres")).toContainText("7 h");
    await expect(resumen(page, "Ingresos estimados")).toContainText("$ 65.000");
  });
});
