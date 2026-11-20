import type { Page } from "@playwright/test";
import {
  CARLOS,
  botonDia,
  buscarCliente,
  dbBase,
  dia,
  expect,
  irADatos,
  reservarComoNuevo,
  sembrar,
  test,
} from "./support/app";

async function verPanel(page: Page, fecha: string): Promise<void> {
  await page.goto("panel/");
  await botonDia(page, fecha).click();
  await expect(page.getByText("Cargando agenda…")).toHaveCount(0);
}

test.describe("Seguridad básica", () => {
  test("CP-SEC-001: Nombre con etiquetas HTML como texto", async ({ page }) => {
    const nombre = '<b>Cliente QA</b> & "Prueba"';
    await reservarComoNuevo(page, {
      servicio: "Corte",
      fecha: dia(1),
      hora: "9:00 a. m.",
      nombre,
      celular: "3000000006",
      correo: "html@example.com",
    });
    await expect(page.getByText(nombre).first()).toBeVisible();
    await expect(page.locator("b", { hasText: "Cliente QA" })).toHaveCount(0);

    await verPanel(page, dia(1));
    await expect(page.getByText(nombre)).toBeVisible();
    await expect(page.locator("b", { hasText: "Cliente QA" })).toHaveCount(0);
  });

  test("CP-SEC-002: Nombre con HTML guardado en localStorage", async ({ page }) => {
    const nombre = '<i>Cliente QA</i> & "Prueba"';
    const base = dbBase({
      bookings: [
        {
          id: "qa-sec", code: "YB-9001", clientId: CARLOS.id, barberId: "yonder", serviceId: "corte",
          date: dia(1), time: "09:00", createdAt: "2026-11-18T12:00:00.000Z", status: "active",
        },
      ],
    });
    base.clients[0] = { ...CARLOS, name: nombre };
    await sembrar(page, base);

    await verPanel(page, dia(1));
    await expect(page.getByText(nombre)).toBeVisible();
    await expect(page.locator("i", { hasText: "Cliente QA" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cancelar cita" })).toBeEnabled();
  });

  test("CP-SEC-003: La búsqueda por celular no expone los datos del cliente", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, CARLOS.phone);
    await expect(page.getByRole("button", { name: "Confirmar cita" })).toBeVisible();

    // Esperado: conocer un celular no debe revelar el correo registrado de esa persona.
    await expect(page.getByText(CARLOS.email)).toHaveCount(0);
  });
});
