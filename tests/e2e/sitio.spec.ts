import {
  abrirReserva,
  expect,
  sinDesbordeHorizontal,
  test,
} from "./support/app";
import type { Page } from "@playwright/test";

function galeria(page: Page) {
  return page.locator("#trabajos");
}

/** Categorías de las fotos visibles en la galería del inicio. */
async function categoriasVisibles(page: Page): Promise<string[]> {
  const textos = await galeria(page).locator("button.works-card span.works-meta").allTextContents();
  return textos.map((texto) => texto.trim());
}

test.describe("Página de información", () => {
  test("CP-INFO-001: Consulta de información y navegación a reservar", async ({ page }) => {
    await page.goto("info/");
    await expect(page.getByRole("heading", { name: "Así funcionaría tu sistema de citas" })).toBeVisible();
    await expect(page.getByText("¿De dónde sale cada costo?")).toBeVisible();

    await page.getByRole("link", { name: /Probar agendar una cita/ }).click();
    await expect(page).toHaveURL(/\/reservar\/?$/);
    await expect(page.getByRole("heading", { name: "¿Qué te vas a hacer?" })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/info\/?$/);
    await page.getByRole("link", { name: "Yonder Barber Studio" }).first().click();
    await expect(page.getByRole("heading", { name: /Tu estilo/i })).toBeVisible();
  });
});

test.describe("Inicio", () => {
  test("CP-HOME-001: Navegación de inicio y enlaces de secciones", async ({ page }) => {
    await page.goto("");
    const nav = page.getByRole("navigation", { name: "Menú de navegación" }).first();
    for (const [enlace, seccion] of [
      ["Servicios", "servicios"],
      ["Trabajos", "trabajos"],
      ["Yonder", "yonder"],
      ["Horario", "horario"],
    ]) {
      await nav.getByRole("link", { name: enlace, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${seccion}$`));
      await expect(page.locator(`#${seccion}`)).toBeInViewport();
    }

    await page.getByRole("link", { name: "Agendar cita" }).first().click();
    await expect(page).toHaveURL(/\/reservar\/?$/);
    await page.getByRole("link", { name: "Yonder Barber Studio" }).first().click();
    await expect(page.getByRole("heading", { name: /Tu estilo/i })).toBeVisible();
  });
});

test.describe("Galería", () => {
  test("CP-GAL-001: Filtro y apertura de fotos de la galería", async ({ page }) => {
    await page.goto("#trabajos");
    const filtros = galeria(page).getByRole("group");

    for (const [filtro, cantidad] of [["Cortes", 7], ["Diseños", 6], ["Barba", 2]] as const) {
      await filtros.getByRole("button", { name: filtro, exact: true }).click();
      await expect(galeria(page).locator("button.works-card")).toHaveCount(cantidad);
      expect(new Set(await categoriasVisibles(page))).toEqual(new Set([filtro]));
    }

    await galeria(page).locator("button.works-card").first().click();
    const visor = page.getByRole("dialog", { name: "Vista previa de la foto" });
    await expect(visor).toBeVisible();
    await visor.getByRole("button", { name: "Cerrar" }).click();
    await expect(visor).toHaveCount(0);

    await filtros.getByRole("button", { name: "Todos", exact: true }).click();
    await expect(galeria(page).locator("button.works-card")).toHaveCount(8);
  });

  test("CP-GAL-002: El visor respeta el filtro de categoría activo", async ({ page }) => {
    await page.goto("#trabajos");
    await galeria(page).getByRole("group").getByRole("button", { name: "Barba", exact: true }).click();
    await galeria(page).locator("button.works-card").first().click();

    const visor = page.getByRole("dialog", { name: "Vista previa de la foto" });
    await expect(visor.getByRole("img")).toHaveAttribute("alt", "Perfilado de barba");
    await visor.getByRole("button", { name: "Siguiente" }).click();

    // Esperado: con el filtro "Barba" activo, la siguiente foto también es de barba.
    await expect(visor.getByRole("img")).toHaveAttribute("alt", "Barba definida");
  });
});

test.describe("Usabilidad", () => {
  test("CP-UX-001: Usabilidad en celular", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("");
    expect(await sinDesbordeHorizontal(page)).toBe(true);

    await page.getByRole("button", { name: "Abrir menú" }).click();
    const menu = page.locator("#menu-movil");
    await expect(menu.getByRole("link", { name: "Servicios" })).toBeVisible();
    await page.getByRole("button", { name: "Cerrar menú" }).click();
    await expect(menu.getByRole("link", { name: "Servicios" })).toBeHidden();

    await page.locator("#trabajos").scrollIntoViewIfNeeded();
    await page.locator("#trabajos").getByRole("group").getByRole("button", { name: "Barba", exact: true }).click();
    expect(await sinDesbordeHorizontal(page)).toBe(true);

    await abrirReserva(page);
    expect(await sinDesbordeHorizontal(page)).toBe(true);
    const continuar = page.getByRole("button", { name: "Continuar" });
    const caja = await continuar.boundingBox();
    expect(caja?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("CP-UX-002: Usabilidad en escritorio", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    for (const ruta of ["", "reservar/", "panel/", "bot/", "info/"]) {
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      expect(await sinDesbordeHorizontal(page), `desborde en /${ruta}`).toBe(true);
    }
    await page.goto("");
    const nav = page.getByRole("navigation", { name: "Menú de navegación" }).first();
    await expect(nav.getByRole("link", { name: "Servicios" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
  });
});

test.describe("Accesibilidad", () => {
  test("CP-A11Y-001: El visor de fotos recibe el foco al abrirse", async ({ page }) => {
    await page.goto("#trabajos");
    const primera = page.locator("#trabajos button.works-card").first();
    await primera.focus();
    await page.keyboard.press("Enter");

    const visor = page.getByRole("dialog", { name: "Vista previa de la foto" });
    await expect(visor).toBeVisible();
    // Esperado: el foco pasa a un elemento dentro del diálogo modal.
    await expect
      .poll(() => visor.evaluate((nodo) => nodo.contains(document.activeElement)))
      .toBe(true);
  });
});

test.describe("Navegación", () => {
  test("CP-NAV-001: Página no encontrada en español", async ({ page }) => {
    const respuesta = await page.goto("pagina-que-no-existe/");
    expect(respuesta?.status()).toBe(404);

    // Esperado: todo texto visible en español y una salida al inicio.
    await expect(page.getByText("This page could not be found.")).toHaveCount(0);
    await expect(page.getByText(/no (existe|encontramos|se encontró)/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /inicio/i }).first()).toBeVisible();
  });
});
