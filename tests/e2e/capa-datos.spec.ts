import { expect, test } from "@playwright/test";
import type { Booking, Client } from "@/lib/types";
import { getAvailableSlots } from "@/lib/availability";
import { services } from "@/config/services";
import { ClientConflictError, createClient } from "@/lib/db";

/**
 * Pruebas de caja blanca sobre src/lib: se ejecutan en Node, sin navegador.
 * db.ts usa window.localStorage, así que se reemplaza por una versión en memoria.
 */
const KEY = "yonder-barberia-db-v2";

function instalarVentanaFalsa(clientes: Client[]) {
  const memoria = new Map<string, string>();
  memoria.set(KEY, JSON.stringify({ clients: clientes, bookings: [], blockedSlots: [] }));
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (clave: string) => memoria.get(clave) ?? null,
      setItem: (clave: string, valor: string) => void memoria.set(clave, valor),
      removeItem: (clave: string) => void memoria.delete(clave),
    },
    dispatchEvent: () => true,
  };
  return () => JSON.parse(memoria.get(KEY) ?? "{}") as { clients: Client[] };
}

const A: Client = { id: "cliente-a", name: "Cliente A", phone: "3001234567", email: "a@example.com" };
const B: Client = { id: "cliente-b", name: "Cliente B", phone: "3109876543", email: "b@example.com" };

test.describe("Capa de datos", () => {
  test.afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  test("CP-DISP-009: Cálculo de duración y disponibilidad por bloques", async () => {
    const servicio = (id: string) => services.find((item) => item.id === id)!;
    // Miércoles lejano, sin restricciones de "hoy": 09:00–12:00 y 14:00–20:00.
    const fecha = "2030-01-02";
    const horas = (id: string, bookings: Booking[] = []) =>
      getAvailableSlots({ date: fecha, barberId: "yonder", service: servicio(id), bookings, blocks: [] })
        .map((slot) => slot.time);

    // 15 y 30 minutos ocupan un bloque: el último inicio de la mañana es 11:30.
    expect(horas("cejas")).toContain("11:30");
    expect(horas("corte")).toContain("11:30");
    expect(horas("corte")).toHaveLength(18);
    // 60 minutos requieren dos bloques: 11:30 y 19:30 exceden el tramo.
    const largos = horas("corte-barba");
    expect(largos).not.toContain("11:30");
    expect(largos).not.toContain("19:30");
    expect(largos).toHaveLength(16);

    // Un bloque ocupado dentro del rango candidato excluye el inicio.
    const ocupada: Booking = {
      id: "b1", code: "YB-1", clientId: "c", barberId: "yonder", serviceId: "corte",
      date: fecha, time: "09:30", createdAt: "2030-01-01T00:00:00Z", status: "active",
    };
    expect(horas("corte-barba", [ocupada])).not.toContain("09:00");
    expect(horas("corte-barba", [ocupada])).toContain("10:00");
    expect(horas("corte", [ocupada])).toContain("09:00");
    // Una cita cancelada no ocupa la agenda.
    expect(horas("corte-barba", [{ ...ocupada, status: "cancelled" }])).toContain("09:00");
  });

  test("CP-DB-001: Ramas de unicidad y conflicto en createClient", async () => {
    const leer = instalarVentanaFalsa([A, B]);

    // Mismo cliente con separadores y mayúsculas: se reutiliza, no se duplica.
    const mismo = await createClient({ name: "A otra vez", phone: "300-123 4567", email: "A@EXAMPLE.COM" });
    expect(mismo.id).toBe(A.id);
    expect(leer().clients).toHaveLength(2);

    // Celular de A y correo de B: conflicto "both" y ningún registro nuevo.
    await expect(
      createClient({ name: "Mixto", phone: A.phone, email: B.email }),
    ).rejects.toMatchObject({ field: "both" });
    expect(leer().clients).toHaveLength(2);

    // Celular existente con correo nuevo: conflicto y ningún registro nuevo.
    await expect(
      createClient({ name: "Duplicado", phone: "300 123 4567", email: "nuevo@example.com" }),
    ).rejects.toBeInstanceOf(ClientConflictError);
    expect(leer().clients).toHaveLength(2);

    // Contactos libres: se crea un cliente normalizado.
    const nuevo = await createClient({ name: " Cliente C ", phone: "311 222 3344", email: "C@Example.com " });
    expect(nuevo).toMatchObject({ name: "Cliente C", phone: "3112223344", email: "c@example.com" });
    expect(leer().clients).toHaveLength(3);
  });
});
