import assert from "node:assert/strict";
import test from "node:test";
import { getContactConflict } from "../src/lib/contact-conflicts.ts";

test("identifica un celular duplicado aunque el correo sea diferente", () => {
  assert.equal(
    getContactConflict({
      phoneMatchId: "cliente-1",
      existingPhone: "3001234567",
      existingEmail: "cliente@example.com",
      phone: "3001234567",
      email: "otro@example.com",
    }),
    "phone",
  );
});

test("identifica un correo duplicado aunque el celular sea diferente", () => {
  assert.equal(
    getContactConflict({
      emailMatchId: "cliente-1",
      existingPhone: "3001234567",
      existingEmail: "cliente@example.com",
      phone: "3109876543",
      email: "cliente@example.com",
    }),
    "email",
  );
});

test("identifica cuando los contactos pertenecen a clientes distintos", () => {
  assert.equal(
    getContactConflict({
      phoneMatchId: "cliente-1",
      emailMatchId: "cliente-2",
      existingPhone: "3001234567",
      existingEmail: "cliente-2@example.com",
      phone: "3001234567",
      email: "cliente-2@example.com",
    }),
    "both",
  );
});

test("no reporta conflicto cuando los contactos pertenecen al mismo cliente", () => {
  assert.equal(
    getContactConflict({
      phoneMatchId: "cliente-1",
      emailMatchId: "cliente-1",
      existingPhone: "3001234567",
      existingEmail: "cliente@example.com",
      phone: "3001234567",
      email: "cliente@example.com",
    }),
    null,
  );
});
