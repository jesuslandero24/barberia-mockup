import {
  CARLOS,
  abrirBot,
  abrirReserva,
  botHastaNombre,
  buscarCliente,
  continuar,
  dbBase,
  dia,
  elegirDia,
  elegirServicio,
  enviarBot,
  expect,
  horasVisibles,
  irADatos,
  leerDb,
  mensajesBot,
  registrar,
  sembrar,
  test,
} from "./support/app";

test.describe("Registro y búsqueda de clientes", () => {
  test("CP-CLI-001: Registro de cliente y persistencia local", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, "3000000001");
    await registrar(page, { nombre: "Cliente QA", correo: "cliente.qa@example.com" });
    await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toBeVisible();

    const db = await leerDb(page);
    const cliente = db.clients.find((item) => item.email === "cliente.qa@example.com");
    expect(cliente).toMatchObject({ name: "Cliente QA", phone: "3000000001" });
    expect(db.bookings.some((item) => item.clientId === cliente?.id)).toBe(true);
  });

  test("CP-CLI-002: Búsqueda de cliente por celular o por correo", async ({ page }) => {
    await abrirBot(page);
    await botHastaNombre(page);
    await enviarBot(page, CARLOS.name);
    await enviarBot(page, CARLOS.phone);
    await expect(page.getByText(/Tu código es YB-\d{4}/)).toBeVisible();

    await abrirBot(page);
    await botHastaNombre(page, { servicio: "2", dia: "3", hora: "1" });
    await enviarBot(page, CARLOS.name);
    await enviarBot(page, CARLOS.email);
    await expect(page.getByText(/Tu código es YB-\d{4}/)).toBeVisible();

    const db = await leerDb(page);
    expect(db.clients).toHaveLength(3);
    expect(db.clients.find((item) => item.id === CARLOS.id)).toEqual(CARLOS);
    const deCarlos = db.bookings.filter(
      (item) => item.clientId === CARLOS.id && item.id.startsWith("cita-"),
    );
    expect(deCarlos).toHaveLength(2);
  });

  test("CP-CLI-003: Pantallas funcionales con base local vacía", async ({ page }) => {
    await sembrar(page, null);

    await page.goto("panel/");
    await expect(page.getByText("Aún no hay citas")).toBeVisible();
    await expect(page.getByRole("button", { name: "Bloquear" }).first()).toBeVisible();

    await abrirReserva(page);
    await elegirServicio(page, "Corte");
    await continuar(page);
    await elegirDia(page, dia(1));
    expect(await horasVisibles(page)).toHaveLength(18);

    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, "3000000001");
    await registrar(page, { nombre: "Cliente QA", correo: "cliente.qa@example.com" });
    await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toBeVisible();

    await abrirBot(page);
    await enviarBot(page, "2");
    await expect(mensajesBot(page).filter({ hasText: "Estos son nuestros precios:" })).toHaveCount(1);

    const db = await leerDb(page);
    expect(db.clients).toHaveLength(1);
    expect(await page.evaluate(() => window.localStorage.getItem("yb-seeded-v2"))).toBe("true");
  });

  test("CP-CLI-004: Búsqueda por celular normalizado desde localStorage", async ({ page }) => {
    const conSeparadores = { ...CARLOS, phone: "300 123-4567" };
    const base = dbBase();
    base.clients = [conSeparadores, ...base.clients.slice(1)];
    await sembrar(page, base);

    await abrirBot(page);
    await botHastaNombre(page);
    await enviarBot(page, CARLOS.name);
    await enviarBot(page, "3001234567");

    // Esperado: se identifica a Carlos comparando solo los dígitos y se agenda.
    await expect(page.getByText(/Tu código es YB-\d{4}/)).toBeVisible();
    const db = await leerDb(page);
    expect(db.clients).toHaveLength(3);
    expect(db.bookings.filter((item) => item.clientId === CARLOS.id)).toHaveLength(1);
  });

  test("CP-CLI-005: Unicidad de celular y correo sin distinguir formato", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");

    // Celular de Carlos con separadores y correo nuevo.
    await buscarCliente(page, "qa.duplicado@example.com");
    await registrar(page, { nombre: "Cliente Duplicado", celular: "300 123 4567" });
    await expect
      .soft(page.getByText("Este celular ya está registrado con otro cliente. Revisa el dato."))
      .toBeVisible();

    // Correo de Carlos en mayúsculas y celular nuevo.
    await buscarCliente(page, "3000000009");
    await registrar(page, { nombre: "Cliente Duplicado", correo: "CARLOS@EXAMPLE.COM" });
    await expect
      .soft(page.getByText("Este correo ya está registrado con otro cliente. Revisa el dato."))
      .toBeVisible();

    const db = await leerDb(page);
    expect(db.clients).toHaveLength(3);
  });

  test("CP-CLI-006: Búsqueda por correo sin distinguir mayúsculas", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, "CARLOS@Example.COM");
    await expect(page.getByText(`Hola de nuevo, ${CARLOS.name}`)).toBeVisible();
    await expect(page.getByText(CARLOS.phone)).toBeVisible();
  });
});
