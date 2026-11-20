import {
  ANDRES,
  CARLOS,
  abrirBot,
  abrirReserva,
  botHastaNombre,
  continuar,
  dia,
  elegirDia,
  elegirServicio,
  enviarBot,
  etiquetaDia,
  expect,
  horasVisibles,
  leerDb,
  mensajesBot,
  test,
  ultimoMensajeBot,
} from "./support/app";

const CONFIRMADA = /Tu código es YB-\d{4}/;

test.describe("Bot de WhatsApp", () => {
  test("CP-BOT-001: Nombre coincidente no verifica la identidad", async ({ page }) => {
    await abrirBot(page);
    await botHastaNombre(page);
    await enviarBot(page, CARLOS.name);
    expect(await ultimoMensajeBot(page)).toBe(
      "Encontré un registro con ese nombre. Escribe el celular o correo con el que ya te registraste.",
    );
    await expect(page.getByText(CONFIRMADA)).toHaveCount(0);

    await enviarBot(page, CARLOS.email);
    await expect(page.getByText(CONFIRMADA)).toBeVisible();
    const db = await leerDb(page);
    expect(db.bookings.some((item) => item.id.startsWith("cita-") && item.clientId === CARLOS.id)).toBe(true);
  });

  test("CP-BOT-002: Solicitar el dato de contacto que falta", async ({ page }) => {
    await abrirBot(page);
    await botHastaNombre(page);
    await enviarBot(page, "Cliente QA");
    expect(await ultimoMensajeBot(page)).toContain("escribe tu celular de 10 dígitos");
    await enviarBot(page, "3000000001");
    expect(await ultimoMensajeBot(page)).toBe("Ahora escribe tu correo electrónico.");

    await enviarBot(page, "no tengo");
    expect(await ultimoMensajeBot(page)).toBe("Ahora escribe tu correo electrónico.");
    await expect(page.getByText(CONFIRMADA)).toHaveCount(0);
    expect((await leerDb(page)).bookings.some((item) => item.id.startsWith("cita-"))).toBe(false);

    await enviarBot(page, "cliente.qa@example.com");
    await expect(page.getByText(CONFIRMADA)).toBeVisible();
  });

  test("CP-BOT-003: Instrucciones y validación de listas numeradas", async ({ page }) => {
    await abrirBot(page);
    await expect(mensajesBot(page).last()).toContainText("Responde únicamente con el número de la opción.");

    const aclaracion = "Para elegir, escribe únicamente el número que aparece junto a la opción.";
    await enviarBot(page, "corte");
    await expect(mensajesBot(page).filter({ hasText: aclaracion })).toHaveCount(1);
    await enviarBot(page, "9");
    await expect(mensajesBot(page).filter({ hasText: aclaracion })).toHaveCount(2);

    await enviarBot(page, "1");
    expect(await ultimoMensajeBot(page)).toContain("Responde únicamente con el número del servicio.");
  });

  test("CP-BOT-004: Respuesta con el dato personal solicitado", async ({ page }) => {
    await abrirBot(page);
    await botHastaNombre(page);
    await enviarBot(page, "Prueba QA");
    await enviarBot(page, "3000000001");
    await enviarBot(page, "qa.reserva@example.com");

    await expect(mensajesBot(page).filter({ hasText: "Revisa tu cita:" })).toHaveCount(1);
    await expect(mensajesBot(page).filter({ hasText: "Para elegir, escribe únicamente" })).toHaveCount(0);
  });

  test("CP-BOT-005: Contactos que pertenecen a clientes distintos", async ({ page }) => {
    await abrirBot(page);
    await botHastaNombre(page);
    const antes = await leerDb(page);
    await enviarBot(page, "Cliente Mixto");
    await enviarBot(page, CARLOS.phone);
    await enviarBot(page, ANDRES.email);

    await expect(
      mensajesBot(page).filter({ hasText: "Ese celular y ese correo pertenecen a clientes distintos." }),
    ).toHaveCount(1);
    await expect(page.getByText(CONFIRMADA)).toHaveCount(0);
    const despues = await leerDb(page);
    expect(despues.clients).toHaveLength(antes.clients.length);
    expect(despues.bookings).toHaveLength(antes.bookings.length);
  });

  test("CP-BOT-006: Consultar la próxima cita por celular", async ({ page }) => {
    await abrirBot(page);
    await enviarBot(page, "3");
    await enviarBot(page, CARLOS.phone);
    await expect(mensajesBot(page).filter({ hasText: "Tu próxima cita:" })).toHaveCount(1);
    await expect(
      mensajesBot(page).filter({ hasText: `Barba con Yonder · ${etiquetaDia(dia(2))} a las 4:00 p. m.` }),
    ).toHaveCount(1);
  });

  test("CP-BOT-007: Cancelar una cita por el bot libera el horario", async ({ page }) => {
    await abrirReserva(page);
    await elegirServicio(page, "Barba");
    await continuar(page);
    await elegirDia(page, dia(2));
    expect(await horasVisibles(page)).not.toContain("4:00 p. m.");

    await abrirBot(page);
    await enviarBot(page, "4");
    await enviarBot(page, CARLOS.phone);
    expect(await ultimoMensajeBot(page)).toContain("¿Cuál cita quieres cancelar?");
    await enviarBot(page, "1");
    await expect(
      mensajesBot(page).filter({
        hasText: `Listo, cancelamos tu cita de Barba el ${etiquetaDia(dia(2))} a las 4:00 p. m.`,
      }),
    ).toHaveCount(1);

    const db = await leerDb(page);
    expect(db.bookings.find((item) => item.id === "seed-yonder-second-2")?.status).toBe("cancelled");
    await abrirReserva(page);
    await elegirServicio(page, "Barba");
    await continuar(page);
    await elegirDia(page, dia(2));
    expect(await horasVisibles(page)).toContain("4:00 p. m.");
  });

  test("CP-BOT-008: Crear otro perfil con el mismo nombre", async ({ page }) => {
    await abrirBot(page);
    await botHastaNombre(page);
    await enviarBot(page, CARLOS.name);
    await enviarBot(page, "3000000002");
    await enviarBot(page, "carlos.nuevo@example.com");
    await expect(page.getByText(CONFIRMADA)).toBeVisible();

    const db = await leerDb(page);
    expect(db.clients).toHaveLength(4);
    expect(db.clients.find((item) => item.id === CARLOS.id)).toEqual(CARLOS);
    expect(db.clients.filter((item) => item.name === CARLOS.name)).toHaveLength(2);
  });

  test("CP-BOT-009: Ver precios desde el menú", async ({ page }) => {
    await abrirBot(page);
    await enviarBot(page, "2");
    const precios = mensajesBot(page).filter({ hasText: "Estos son nuestros precios:" });
    await expect(precios).toHaveCount(1);
    for (const linea of [
      "• Corte · 30 min · $ 20.000",
      "• Barba · 30 min · $ 12.000",
      "• Corte + barba · 60 min · $ 30.000",
      "• Cejas · 15 min · $ 8.000",
      "• Corte con diseño · 60 min · $ 35.000",
    ]) {
      await expect(precios).toContainText(linea);
    }
  });
});
