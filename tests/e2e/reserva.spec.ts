import {
  CARLOS,
  abrirReserva,
  alertas,
  botonHora,
  botonServicio,
  buscarCliente,
  continuar,
  dia,
  elegirDia,
  elegirServicio,
  etiquetaDia,
  expect,
  irADatos,
  leerDb,
  registrar,
  test,
} from "./support/app";

test.describe("Flujo de reserva", () => {
  test("CP-RES-001: Avance secuencial de los tres pasos", async ({ page }) => {
    await abrirReserva(page);
    const pasoActivo = page.locator('[aria-current="step"]');
    const siguiente = page.getByRole("button", { name: "Continuar" });

    await expect(pasoActivo).toContainText("Servicio");
    await expect(siguiente).toBeDisabled();
    await elegirServicio(page, "Corte");
    await expect(siguiente).toBeEnabled();
    await continuar(page);

    await expect(pasoActivo).toContainText("Fecha y hora");
    await expect(siguiente).toBeDisabled();
    await elegirDia(page, dia(1));
    await expect(siguiente).toBeDisabled();
    await botonHora(page, "9:00 a. m.").click();
    await expect(siguiente).toBeEnabled();
    await continuar(page);

    await expect(pasoActivo).toContainText("Tus datos");
    const resumen = page.locator("aside, dl").filter({ hasText: "Servicio" }).first();
    await expect(resumen).toContainText("Corte");
    await expect(page.getByText(etiquetaDia(dia(1))).first()).toBeVisible();

    await buscarCliente(page, "3000000001");
    await registrar(page, { nombre: "Prueba QA", correo: "qa.reserva@example.com" });
    await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toBeVisible();
    await expect(page.getByText(/^YB-\d{4}$/)).toBeVisible();
  });

  test("CP-RES-002: Validación de datos personales vacíos", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    const antes = await leerDb(page);

    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(alertas(page)).toHaveText(
      "Escribe un celular de 10 dígitos que empiece por 3 o un correo válido.",
    );

    await buscarCliente(page, "3000000001");
    await registrar(page, { nombre: "", celular: "", correo: "" });
    await expect(page.getByText("Escribe tu nombre completo.")).toBeVisible();
    await expect(page.getByText("El celular debe tener 10 dígitos y empezar por 3.")).toBeVisible();
    await expect(page.getByText("Escribe un correo válido.")).toBeVisible();

    const despues = await leerDb(page);
    expect(despues.clients).toHaveLength(antes.clients.length);
    expect(despues.bookings).toHaveLength(antes.bookings.length);
  });

  test("CP-RES-003: Verificación de identidad por contacto guardado", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");

    // El nombre por sí solo no sirve como identificador.
    await buscarCliente(page, CARLOS.name);
    await expect(alertas(page)).toBeVisible();
    await expect(page.getByText(/Hola de nuevo/)).toHaveCount(0);

    // Con el celular guardado sí se identifica el perfil.
    await buscarCliente(page, CARLOS.phone);
    await expect(page.getByText(`Hola de nuevo, ${CARLOS.name}`)).toBeVisible();
  });

  test("CP-RES-004: Rechazo de celular y correo inválidos", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, "3000000001");
    await registrar(page, { nombre: "Prueba QA", celular: "12345", correo: "qa-sin-dominio" });

    await expect(page.getByText("El celular debe tener 10 dígitos y empezar por 3.")).toBeVisible();
    await expect(page.getByText("Escribe un correo válido.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toHaveCount(0);
    const db = await leerDb(page);
    expect(db.clients.some((cliente) => cliente.name === "Prueba QA")).toBe(false);
  });

  test("CP-RES-005: Registro de cliente y confirmación de reserva", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, "3000000001");
    await registrar(page, { nombre: "Prueba QA", correo: "qa.reserva@example.com" });

    await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toBeVisible();
    await expect(page.getByText("Esta es una simulación visual. No se envía ningún mensaje real.")).toBeVisible();

    const db = await leerDb(page);
    const cliente = db.clients.find((item) => item.phone === "3000000001");
    expect(cliente).toMatchObject({ name: "Prueba QA", email: "qa.reserva@example.com" });
    const nueva = db.bookings.find((item) => item.clientId === cliente?.id);
    expect(nueva).toMatchObject({ barberId: "yonder", serviceId: "corte", date: dia(1), time: "09:00", status: "active" });
  });

  test("CP-RES-006: Servicio preseleccionado desde el enlace de la tarjeta", async ({ page }) => {
    await abrirReserva(page, "reservar/?servicio=diseno");
    await expect(botonServicio(page, "Corte con diseño")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("$ 35.000").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
  });

  test("CP-RES-007: Cambiar de servicio limpia la fecha y la hora elegidas", async ({ page }) => {
    await abrirReserva(page);
    await elegirServicio(page, "Corte");
    await continuar(page);
    await elegirDia(page, dia(1));
    await botonHora(page, "9:00 a. m.").click();

    await page.getByRole("button", { name: "Atrás" }).click();
    await elegirServicio(page, "Barba");
    await continuar(page);

    await expect(page.getByText("Elige un día para ver las horas disponibles.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
    await expect(page.getByText("Sin elegir")).toHaveCount(2);
  });

  test("CP-RES-008: Horario ocupado en otra pestaña antes de confirmar", async ({ page, context }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");

    // Otra persona reserva la misma hora desde otra pestaña.
    const otra = await context.newPage();
    await otra.clock.setFixedTime(new Date("2026-11-18T08:00:00-05:00"));
    await irADatos(otra, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(otra, "3000000002");
    await registrar(otra, { nombre: "Cliente Rápido", correo: "rapido@example.com" });
    await expect(otra.getByRole("heading", { name: "Tu cita quedó lista" })).toBeVisible();

    await buscarCliente(page, CARLOS.phone);
    await page.getByRole("button", { name: "Confirmar cita" }).click();
    await expect(page.getByText("Ese horario ya no está disponible. Elige otra hora.")).toBeVisible();
    const db = await leerDb(page);
    const nueveAm = db.bookings.filter((item) => item.date === dia(1) && item.time === "09:00" && item.status === "active");
    expect(nueveAm).toHaveLength(1);
  });

  test("CP-RES-009: El nombre debe contener letras", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, "3000000003");
    await registrar(page, { nombre: "12345", correo: "solo.numeros@example.com" });

    // Esperado: un nombre compuesto solo por números no es un nombre completo.
    await expect(page.getByText("Escribe tu nombre completo.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toHaveCount(0);
  });

  test("CP-RES-010: Selección y resumen del servicio", async ({ page }) => {
    await abrirReserva(page);
    const tarjeta = botonServicio(page, "Corte + barba");
    await tarjeta.click();
    await expect(tarjeta).toHaveAttribute("aria-pressed", "true");
    await expect(tarjeta).toContainText("60 min");
    await expect(page.getByText("$ 30.000").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
  });

  test("CP-RES-011: \"No soy yo\" reinicia la búsqueda del cliente", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, CARLOS.phone);
    await expect(page.getByText(`Hola de nuevo, ${CARLOS.name}`)).toBeVisible();

    await page.getByRole("button", { name: "No soy yo, buscar de nuevo" }).click();
    await expect(page.getByLabel("Celular o correo")).toHaveValue("");
    await expect(page.getByText(/Hola de nuevo/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Confirmar cita" })).toHaveCount(0);
  });

  test("CP-RES-012: Correo con puntos consecutivos en el dominio", async ({ page }) => {
    await irADatos(page, "Corte", dia(1), "9:00 a. m.");
    await buscarCliente(page, "3000000004");
    await registrar(page, { nombre: "Prueba Correo", correo: "qa@dominio..com" });

    // Esperado: "dominio..com" no es un dominio válido y debe rechazarse.
    await expect(page.getByText("Escribe un correo válido.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toHaveCount(0);
  });
});
