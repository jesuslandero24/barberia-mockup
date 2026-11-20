import { dia, etiquetaDia, expect, reservarComoNuevo, test } from "./support/app";

test.describe("Mensajes simulados de WhatsApp", () => {
  test("CP-WA-001: Contenido del recordatorio al cliente", async ({ page }) => {
    await reservarComoNuevo(page, {
      servicio: "Corte",
      fecha: dia(0),
      hora: "3:00 p. m.",
      nombre: "Ana Torres",
      celular: "3005550101",
      correo: "ana.torres@example.com",
    });
    await expect(page.getByText("Así le llega a Ana Torres, 1 hora antes de la cita")).toBeVisible();
    await expect(
      page.getByText(
        "Hola Ana Torres, te recordamos tu cita de hoy a las 3:00 p. m. con Yonder (Corte). Te esperamos en Yonder Barber Studio.",
      ),
    ).toBeVisible();
  });

  test("CP-WA-002: Aviso simulado al barbero después de reservar", async ({ page }) => {
    // Jueves 26 de noviembre a las 3:00 p. m. (el jueves 19 a esa hora ya está ocupado).
    await reservarComoNuevo(page, {
      servicio: "Corte",
      fecha: dia(8),
      hora: "3:00 p. m.",
      nombre: "Ana Torres",
      celular: "3005550101",
      correo: "ana.torres@example.com",
    });
    await expect(page.getByText("Así le llega a Yonder al reservar")).toBeVisible();
    await expect(
      page.getByText(`Nueva cita: Ana Torres (3005550101) · Corte · ${etiquetaDia(dia(8))} a las 3:00 p. m.`),
    ).toBeVisible();
  });

  test("CP-WA-003: Hora del recordatorio exactamente 60 minutos antes", async ({ page }) => {
    await reservarComoNuevo(page, {
      servicio: "Corte",
      fecha: dia(1),
      hora: "4:00 p. m.",
      nombre: "Cliente Recordatorio",
      celular: "3005550102",
      correo: "recordatorio@example.com",
    });
    const recordatorio = page
      .getByText("Así le llega a Cliente Recordatorio, 1 hora antes de la cita")
      .locator("..");
    await expect(recordatorio).toContainText("a las 4:00 p. m.");
    await expect(recordatorio).toContainText("3:00 p. m.");
  });

  test("CP-WA-004: Mensajes visuales sin envío real por WhatsApp", async ({ page }) => {
    const externas: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (/wa\.me|whatsapp|graph\.facebook|api\.twilio/i.test(url)) externas.push(url);
    });
    await reservarComoNuevo(page, {
      servicio: "Barba",
      fecha: dia(1),
      hora: "9:00 a. m.",
      nombre: "Cliente Red",
      celular: "3005550103",
      correo: "red@example.com",
    });
    await expect(page.getByText("Esta es una simulación visual. No se envía ningún mensaje real.")).toBeVisible();
    expect(externas).toEqual([]);
  });
});
