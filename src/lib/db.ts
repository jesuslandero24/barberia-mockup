import type { BlockedSlot, Booking, Client } from "@/lib/types";
import { services } from "@/config/services";
import {
  addDays,
  getAvailableSlots,
  getBogotaToday,
} from "@/lib/availability";
import { getContactConflict } from "@/lib/contact-conflicts";

export const STORAGE_KEY = "yonder-barberia-db-v2";
export const SEED_SUPPRESSION_KEY = "yb-seeded-v2";
export const DATABASE_CHANGE_EVENT = "yonder-barberia-db-change";

export class ClientConflictError extends Error {
  constructor(readonly field: "phone" | "email" | "both") {
    super(`Client ${field} is already registered.`);
    this.name = "ClientConflictError";
  }
}

type Database = {
  clients: Client[];
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
};

function emptyDatabase(): Database {
  return { clients: [], bookings: [], blockedSlots: [] };
}

function makeId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function makeBookingCode(existing: Booking[]): string {
  const used = new Set(existing.map((booking) => booking.code));
  let code = "";

  do {
    code = `YB-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (used.has(code));

  return code;
}

function normalize(data: Partial<Database> | null | undefined): Database {
  return {
    clients: Array.isArray(data?.clients) ? data.clients : [],
    bookings: Array.isArray(data?.bookings) ? data.bookings : [],
    blockedSlots: Array.isArray(data?.blockedSlots) ? data.blockedSlots : [],
  };
}

function normalizeClientName(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function seedDatabase(): Database {
  const clients: Client[] = [
    {
      id: "cliente-carlos",
      name: "Carlos Pérez",
      phone: "3001234567",
      email: "carlos@example.com",
    },
    {
      id: "cliente-andres",
      name: "Andrés Gómez",
      phone: "3109876543",
      email: "andres@example.com",
    },
    {
      id: "cliente-laura",
      name: "Laura Restrepo",
      phone: "3128979997",
      email: "laura@example.com",
    },
  ];

  const bookings: Booking[] = [];
  const today = getBogotaToday();
  const clientIds = clients.map((client) => client.id);
  const createdAt = new Date().toISOString();

  for (let offset = 1; offset <= 7; offset += 1) {
    const date = addDays(today, offset);
    const clientId = clientIds[offset % clientIds.length];

    bookings.push({
      id: `seed-yonder-${offset}`,
      code: `YB-${4100 + offset}`,
      clientId,
      barberId: "yonder",
      serviceId: offset % 2 === 0 ? "corte" : "corte-barba",
      date,
      time: offset % 2 === 0 ? "10:00" : "15:00",
      createdAt,
      status: "active",
    });

    bookings.push({
      id: `seed-yonder-second-${offset}`,
      code: `YB-${4200 + offset}`,
      clientId: clientIds[(offset + 1) % clientIds.length],
      barberId: "yonder",
      serviceId: offset % 2 === 0 ? "barba" : "diseno",
      date,
      time: offset % 2 === 0 ? "16:00" : "11:00",
      createdAt,
      status: "active",
    });

    if (offset % 3 === 0) {
      bookings.push({
        id: `seed-yonder-extra-${offset}`,
        code: `YB-${4300 + offset}`,
        clientId: clientIds[(offset + 2) % clientIds.length],
        barberId: "yonder",
        serviceId: "corte",
        date,
        time: "17:00",
        createdAt,
        status: "active",
      });
    }
  }

  return { clients, bookings, blockedSlots: [] };
}

function write(database: Database, bookingDate?: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  window.dispatchEvent(
    new CustomEvent(DATABASE_CHANGE_EVENT, { detail: { bookingDate } }),
  );
}

function read(): Database {
  if (typeof window === "undefined") return emptyDatabase();

  const suppressSeeds =
    window.localStorage.getItem(SEED_SUPPRESSION_KEY) === "true";
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initial = suppressSeeds ? emptyDatabase() : seedDatabase();
    write(initial);
    return initial;
  }

  try {
    return normalize(JSON.parse(raw) as Partial<Database>);
  } catch {
    const fallback = suppressSeeds ? emptyDatabase() : seedDatabase();
    write(fallback);
    return fallback;
  }
}

export async function clearAllData(): Promise<void> {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEED_SUPPRESSION_KEY, "true");
  write(emptyDatabase());
}

export function resetExampleData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(SEED_SUPPRESSION_KEY);
}

export async function getClient(id: string): Promise<Client | null> {
  const database = read();
  return database.clients.find((client) => client.id === id) ?? null;
}

export async function findClient(identifier: string): Promise<Client | null> {
  const value = identifier.trim();
  if (!value) return null;

  const database = read();

  if (value.includes("@")) {
    const email = value.toLowerCase();
    return (
      database.clients.find(
        (client) => client.email.toLowerCase() === email,
      ) ?? null
    );
  }

  const phone = value.replace(/\D/g, "");
  return (
    database.clients.find((client) => client.phone.replace(/\D/g, "") === phone) ??
    null
  );
}

export async function findClientsByName(name: string): Promise<Client[]> {
  const normalizedName = normalizeClientName(name);
  if (!normalizedName) return [];

  const database = read();
  return database.clients.filter(
    (client) => normalizeClientName(client.name) === normalizedName,
  );
}

export async function createClient(input: {
  name: string;
  phone: string;
  email: string;
}): Promise<Client> {
  const database = read();
  const phone = input.phone.replace(/\D/g, "");
  const email = input.email.trim().toLowerCase();
  const phoneMatch = database.clients.find(
    (client) => phone !== "" && client.phone.replace(/\D/g, "") === phone,
  );
  const emailMatch = database.clients.find(
    (client) => email !== "" && client.email.trim().toLowerCase() === email,
  );

  if (phoneMatch && emailMatch && phoneMatch.id !== emailMatch.id) {
    throw new ClientConflictError("both");
  }

  const existing = phoneMatch ?? emailMatch;

  if (existing) {
    const conflict = getContactConflict({
      phoneMatchId: phoneMatch?.id,
      emailMatchId: emailMatch?.id,
      existingPhone: existing.phone,
      existingEmail: existing.email,
      phone,
      email,
    });

    if (conflict) {
      throw new ClientConflictError(conflict);
    }

    if (!existing.phone) existing.phone = phone;
    if (!existing.email) existing.email = email;
    write(database);
    return existing;
  }

  const client: Client = {
    id: makeId("cliente"),
    name: input.name.trim(),
    phone,
    email,
  };

  database.clients.push(client);
  write(database);
  return client;
}

export async function getBookings({
  date,
  barberId,
}: {
  date: string;
  barberId: string;
}): Promise<Booking[]> {
  const database = read();

  return database.bookings.filter(
    (booking) =>
      booking.date === date &&
      booking.barberId === barberId &&
      booking.status === "active",
  );
}

export async function getClientBookings(
  clientId: string,
): Promise<Booking[]> {
  const database = read();

  return database.bookings
    .filter(
      (booking) => booking.clientId === clientId && booking.status === "active",
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

export async function getBlockedSlots({
  date,
  barberId,
}: {
  date: string;
  barberId: string;
}): Promise<BlockedSlot[]> {
  const database = read();

  return database.blockedSlots.filter(
    (block) => block.date === date && block.barberId === barberId,
  );
}

export async function createBooking(input: {
  clientId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
}): Promise<Booking> {
  const database = read();
  const service = services.find((item) => item.id === input.serviceId);

  if (!service) {
    throw new Error("El servicio seleccionado no existe.");
  }

  const activeBookings = database.bookings.filter(
    (booking) =>
      booking.date === input.date &&
      booking.barberId === input.barberId &&
      booking.status === "active",
  );
  const blocks = database.blockedSlots.filter(
    (block) =>
      block.date === input.date && block.barberId === input.barberId,
  );

  const available = getAvailableSlots({
    date: input.date,
    barberId: input.barberId,
    service,
    bookings: activeBookings,
    blocks,
  });

  if (!available.some((slot) => slot.time === input.time)) {
    throw new Error("Ese horario ya no está disponible. Elige otra hora.");
  }

  const booking: Booking = {
    id: makeId("cita"),
    code: makeBookingCode(database.bookings),
    clientId: input.clientId,
    barberId: input.barberId,
    serviceId: input.serviceId,
    date: input.date,
    time: input.time,
    createdAt: new Date().toISOString(),
    status: "active",
  };

  database.bookings.push(booking);
  write(database, input.date);
  return booking;
}

export async function cancelBooking(id: string): Promise<void> {
  const database = read();
  const booking = database.bookings.find((item) => item.id === id);

  if (!booking) return;

  booking.status = "cancelled";
  write(database);
}

export async function blockSlot(input: {
  barberId: string;
  date: string;
  time: string;
}): Promise<BlockedSlot> {  const database = read();
  const existing = database.blockedSlots.find(
    (block) =>
      block.barberId === input.barberId &&
      block.date === input.date &&
      block.time === input.time,
  );

  if (existing) return existing;

  const block: BlockedSlot = {
    id: makeId("bloqueo"),
    barberId: input.barberId,
    date: input.date,
    time: input.time,
  };

  database.blockedSlots.push(block);
  write(database);
  return block;
}

export async function unblockSlot(id: string): Promise<void> {
  const database = read();
  database.blockedSlots = database.blockedSlots.filter(
    (block) => block.id !== id,
  );
  write(database);
}
