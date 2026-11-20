import {
  SEED_FLAG,
  abrirMenuDemo,
  abrirReserva,
  dbBase,
  dia,
  expect,
  leerDb,
  reservarComoNuevo,
  sembrar,
  test,
} from "./support/app";

test.describe("Menú Demo", () => {
  test("CP-DEMO-001: Reinicio de datos de ejemplo", async ({ page }) => {
    await sembrar(page, dbBase({ clients: [{ id: "qa-1", name: "Cliente QA", phone: "3000000001", email: "qa@example.com" }] }), {
      [SEED_FLAG]: "true",
    });
    await page.goto("");
    expect((await leerDb(page)).clients).toHaveLength(1);

    await abrirMenuDemo(page);
    page.once("dialog", (dialog) => dialog.accept());
    await Promise.all([
      page.waitForEvent("load"),
      page.getByRole("button", { name: "Reiniciar datos de ejemplo" }).click(),
    ]);

    await page.goto("panel/");
    await expect(page.getByRole("heading", { name: "Agenda del día" })).toBeVisible();
    const db = await leerDb(page);
    expect(db.clients.map((item) => item.name)).toEqual(["Carlos Pérez", "Andrés Gómez", "Laura Restrepo"]);
    expect(db.bookings).toHaveLength(16);
    expect(new Set(db.bookings.map((item) => item.date)).size).toBe(7);
    expect(await page.evaluate((flag) => window.localStorage.getItem(flag), SEED_FLAG)).toBeNull();
  });

  test("CP-DEMO-002: Borrado de prueba confirmado con doble toque", async ({ page }) => {
    await sembrar(page, dbBase(), { "clave-ajena": "conservar" });
    await page.goto("");
    await abrirMenuDemo(page);

    const borrar = page.getByRole("button", { name: "Borrar datos de prueba" });
    await borrar.click();
    const confirmar = page.getByRole("button", { name: "¿Seguro? Toca otra vez" });
    await expect(confirmar).toBeVisible();
    await Promise.all([page.waitForEvent("load"), confirmar.click()]);

    await expect(page.getByText("Datos eliminados")).toBeVisible();
    const db = await leerDb(page);
    expect(db).toEqual({ clients: [], bookings: [], blockedSlots: [] });
    expect(await page.evaluate((flag) => window.localStorage.getItem(flag), SEED_FLAG)).toBe("true");
    expect(await page.evaluate(() => window.localStorage.getItem("clave-ajena"))).toBe("conservar");
  });

  test("CP-DEMO-003: El segundo toque fuera de plazo no borra datos", async ({ page }) => {
    await page.goto("panel/");
    await expect(page.getByRole("heading", { name: "Agenda del día" })).toBeVisible();
    await abrirMenuDemo(page);
    await page.getByRole("button", { name: "Borrar datos de prueba" }).click();
    await expect(page.getByRole("button", { name: "¿Seguro? Toca otra vez" })).toBeVisible();

    await page.waitForTimeout(4_500);
    await expect(page.getByRole("button", { name: "Borrar datos de prueba" })).toBeVisible();
    await page.getByRole("button", { name: "Borrar datos de prueba" }).click();

    await expect(page.getByRole("button", { name: "¿Seguro? Toca otra vez" })).toBeVisible();
    const db = await leerDb(page);
    expect(db.clients).toHaveLength(3);
    expect(await page.evaluate((flag) => window.localStorage.getItem(flag), SEED_FLAG)).toBeNull();
  });

  test("CP-DEMO-004: Persistencia de datos nuevos después del borrado", async ({ page }) => {
    await sembrar(page, null);
    await reservarComoNuevo(page, {
      servicio: "Corte",
      fecha: dia(1),
      hora: "9:00 a. m.",
      nombre: "Cliente Persistente",
      celular: "3000000005",
      correo: "persistente@example.com",
    });

    await page.reload();
    const db = await leerDb(page);
    expect(db.clients.map((item) => item.name)).toEqual(["Cliente Persistente"]);
    expect(db.bookings).toHaveLength(1);

    await page.goto("panel/");
    await expect(page.getByText("Cliente Persistente")).toBeVisible();
    await abrirReserva(page);
  });
});
