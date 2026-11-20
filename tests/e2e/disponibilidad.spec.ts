import {
  abrirReserva,
  bloqueo,
  botonDia,
  buscarCliente,
  cita,
  continuar,
  dbBase,
  dia,
  elegirDia,
  elegirServicio,
  etiquetaDia,
  expect,
  horasVisibles,
  irADatos,
  registrar,
  sembrar,
  test,
} from "./support/app";
import type { Page } from "@playwright/test";

async function verHoras(page: Page, servicio: string, fecha: string): Promise<string[]> {
  await abrirReserva(page);
  await elegirServicio(page, servicio);
  await continuar(page);
  await elegirDia(page, fecha);
  return horasVisibles(page);
}

test.describe("Disponibilidad de horas", () => {
  test("CP-DISP-001: Servicio de 15 minutos ocupa un bloque", async ({ page }) => {
    expect(await verHoras(page, "Cejas", dia(1))).toContain("9:00 a. m.");
    await page.goto("about:blank");

    await irADatos(page, "Cejas", dia(1), "9:00 a. m.");
    await buscarCliente(page, "3000000011");
    await registrar(page, { nombre: "Cliente Cejas", correo: "cejas@example.com" });
    await expect(page.getByRole("heading", { name: "Tu cita quedó lista" })).toBeVisible();

    const horas = await verHoras(page, "Cejas", dia(1));
    expect(horas).not.toContain("9:00 a. m.");
    expect(horas).toContain("9:30 a. m.");
  });

  test("CP-DISP-002: Servicio que cruza el receso de mediodía", async ({ page }) => {
    const horas = await verHoras(page, "Corte + barba", dia(1));
    expect(horas).not.toContain("11:30 a. m.");
    expect(horas).toContain("2:00 p. m.");
    expect(horas).not.toContain("12:00 p. m.");
    expect(horas).not.toContain("1:00 p. m.");
  });

  test.describe("con la hora de prueba 3:00 p. m.", () => {
    test.use({ ahora: "2026-11-18T15:00:00-05:00" });

    test("CP-DISP-003: Ocultar horas pasadas de hoy", async ({ page }) => {
      const horas = await verHoras(page, "Corte", dia(0));
      expect(horas).not.toContain("2:30 p. m.");
      expect(horas).not.toContain("9:00 a. m.");
      expect(horas).toContain("4:00 p. m.");
    });
  });

  test("CP-DISP-004: Excluir horas que se cruzan con una cita o bloqueo", async ({ page }) => {
    await sembrar(
      page,
      dbBase({
        bookings: [cita({ date: dia(1), time: "10:00", serviceId: "corte-barba" })],
        blockedSlots: [bloqueo(dia(2), "10:30")],
      }),
    );
    const conCita = await verHoras(page, "Corte", dia(1));
    expect(conCita).not.toContain("10:00 a. m.");
    expect(conCita).not.toContain("10:30 a. m.");
    expect(conCita).toContain("11:00 a. m.");

    await elegirDia(page, dia(2));
    const conBloqueo = await horasVisibles(page);
    expect(conBloqueo).not.toContain("10:30 a. m.");
    expect(conBloqueo).toContain("11:00 a. m.");
  });

  test("CP-DISP-005: Límite de los próximos 14 días", async ({ page }) => {
    await abrirReserva(page);
    await elegirServicio(page, "Corte");
    await continuar(page);
    const dias = page.getByRole("button", {
      name: /^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo) \d{1,2} de [a-z]+$/,
    });
    await expect(dias).toHaveCount(14);
    await expect(dias.first()).toHaveAccessibleName(etiquetaDia(dia(0)));
    await expect(dias.last()).toHaveAccessibleName(etiquetaDia(dia(13)));
    await expect(botonDia(page, dia(14))).toHaveCount(0);
  });

  test("CP-DISP-006: Servicio de 60 minutos requiere dos bloques seguidos", async ({ page }) => {
    await sembrar(page, dbBase({ blockedSlots: [bloqueo(dia(1), "09:30")] }));
    const horas = await verHoras(page, "Corte + barba", dia(1));
    expect(horas).not.toContain("9:00 a. m.");
    expect(horas).toContain("10:00 a. m.");
  });

  test("CP-DISP-007: Servicio que excede el cierre diario", async ({ page }) => {
    const horas = await verHoras(page, "Corte + barba", dia(0));
    expect(horas).toContain("7:00 p. m.");
    expect(horas).not.toContain("7:30 p. m.");
  });

  test.describe("con la hora de prueba 10:15 a. m.", () => {
    test.use({ ahora: "2026-11-18T10:15:00-05:00" });

    test("CP-DISP-008: Ocultar los próximos 30 minutos de hoy", async ({ page }) => {
      const horas = await verHoras(page, "Corte", dia(0));
      expect(horas).not.toContain("10:30 a. m.");
      expect(horas).toContain("11:00 a. m.");
    });
  });

  test("CP-DISP-010: Sábado en jornada continua sin receso", async ({ page }) => {
    const horas = await verHoras(page, "Corte", dia(3));
    expect(horas).toContain("12:00 p. m.");
    expect(horas).toContain("1:30 p. m.");
    expect(horas).toContain("8:30 p. m.");
    expect(horas).not.toContain("9:00 p. m.");
  });

  test("CP-DISP-011: Mostrar sin seleccionar un día sin horas libres", async ({ page }) => {
    const horas = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    ];
    await sembrar(page, dbBase({ blockedSlots: horas.map((hora) => bloqueo(dia(1), hora)) }));
    await abrirReserva(page);
    await elegirServicio(page, "Corte");
    await continuar(page);

    await expect(botonDia(page, dia(1))).toBeDisabled();
    await expect(botonDia(page, dia(2))).toBeEnabled();
    await elegirDia(page, dia(2));
    await expect(botonDia(page, dia(2))).toHaveAttribute("aria-pressed", "true");
  });

  test("CP-DISP-012: El domingo cierra a las 7:00 p. m.", async ({ page }) => {
    const horas = await verHoras(page, "Corte + barba", dia(4));
    expect(horas).toContain("6:00 p. m.");
    expect(horas).not.toContain("6:30 p. m.");
    expect(horas).not.toContain("7:00 p. m.");
  });
});
