# Proyecto: página de citas para una barbería (MOCKUP)

## Qué estamos construyendo
Un mockup funcional (se ve y se siente como la página real) para mostrárselo a Yonder, dueño de una barbería. Él no sabe que existe. El objetivo es impresionarlo: debe verse profesional, moderna, urbana, elegante y muy organizada.

Todavía NO hay backend real. Los datos viven en el navegador (localStorage) detrás de una capa de datos que después se cambia por Supabase sin tocar las pantallas.

## Reglas de trabajo (obligatorias)
1. Trabaja por pasos. No avances al siguiente paso hasta que yo lo pida.
2. Al terminar cada paso ejecuta `npm run build`. Si hay errores, arréglalos antes de responder. Luego dime en máximo 5 líneas qué hiciste.
3. Antes de usar una API de Next.js o Tailwind, consulta la documentación con Context7 (escribe "use context7"). Revisa la versión instalada en package.json; Tailwind v4 se configura en CSS (`@theme` en globals.css), no con tailwind.config.js.
4. Dependencias permitidas: next, react, tailwindcss, lucide-react. Si necesitas otra, pregúntame primero.
5. Todo texto visible va en español de Colombia, tono cercano y profesional.
6. Nada de textos, precios, horarios ni nombres quemados dentro de los componentes: todo sale de `src/config/`.
7. Mobile first. La mayoría lo verá desde el celular. Probar también en escritorio.
8. Componentes pequeños, código simple, comentarios solo donde ayuden.
9. Si algo no te queda claro, pregúntame antes de hacerlo.
10. No uses emojis en la interfaz, salvo en los mensajes simulados de WhatsApp.

## Datos del negocio (van en `src/config/`)
Archivo `brand.ts`:
- name: "Yonder Barber Studio" (nombre provisional, debe ser fácil de cambiar)
- tagline: "Cortes con precisión. Estilo con identidad."
- whatsapp: "573000000000" (provisional)
- address: "Dirección por confirmar"

Archivo `barbers.ts` (Yonder es el único barbero del proyecto):
- { id: "yonder", name: "Yonder", role: "Barbero profesional" }
- El flujo de reserva tiene 3 pasos: Servicio, Fecha y hora, Tus datos.

Archivo `services.ts` (precios de ejemplo en COP, se editarán):
- corte: "Corte", 30 min, 20000
- barba: "Barba", 30 min, 12000
- corte-barba: "Corte + barba", 60 min, 30000
- cejas: "Cejas", 15 min, 8000
- diseno: "Corte con diseño", 60 min, 35000

Archivo `schedule.ts` (horario provisional por confirmar):
- Lunes a viernes: 09:00–12:00 y 14:00–20:00
- Sábado: 09:00–21:00
- Domingo: 09:00–19:00
- Zona horaria: America/Bogota. Intervalo de agenda: 30 minutos.

## Fotos (ya están en `public/fotos/`, 600x820 aprox., verticales)
- cortes-01 a cortes-07 → categoría "Cortes"
- disenos-01 a disenos-06 → categoría "Diseños" (cortes con dibujos y líneas en el cabello)
- barba-01 y barba-02 → categoría "Barba"
Usa `next/image`. Las fotos tienen capas verde neón de fondo: eso NO es el color de la marca.

## Diseño
Inspiración: el local tiene madera clara con listones verticales y paneles negros geométricos en 3D.
- Tema oscuro. Colores como variables en `globals.css` para cambiarlos en un solo lugar:
  - fondo #0A0A0B, superficie #141416, borde #26262A
  - texto #F4F4F5, texto suave #A1A1AA
  - acento #D4A95A (dorado cálido) y acento-suave #8A6B33
- Tipografías con `next/font/google`: "Barlow Condensed" (títulos, mayúsculas, grandes) e "Inter" (texto).
- Detalles: líneas verticales finas como listones, textura geométrica muy sutil en fondos, bordes de 1px, esquinas de 12–16px, sombras suaves, transiciones de 200ms al pasar el mouse.
- Espacios generosos, jerarquía clara, botones grandes y fáciles de tocar en celular.
- Evitar el look genérico de plantilla: nada de degradados morados, nada de tarjetas todas iguales sin ritmo.
- No hay logo: crea un monograma simple "Y" en un círculo o rombo como logo provisional (componente `Logo.tsx`).

## Estructura de carpetas
```
src/
  app/
    layout.tsx, page.tsx            (página principal)
    reservar/page.tsx               (flujo de reserva)
    panel/page.tsx                  (panel del barbero)
    bot/page.tsx                    (simulador del bot de WhatsApp)
  components/                       (componentes pequeños y reutilizables)
  config/                           (brand, barbers, services, schedule)
  lib/
    db.ts                           (capa de datos, ver abajo)
    availability.ts                 (cálculo de horas libres)
    types.ts
public/fotos/
```

## Capa de datos (`src/lib/db.ts`)
Funciones asíncronas, para poder cambiarlas luego por Supabase:
- `findClient(identifier)` busca por celular (solo dígitos, 10 números) o por correo (en minúsculas)
- `createClient({ name, phone, email })`
- Los clientes nuevos deben quedar registrados con nombre, celular y correo. El celular se compara solo con dígitos y el correo sin distinguir mayúsculas; ambos deben ser únicos entre clientes.
- Antes de reservar, el bot pide el nombre completo y busca si el cliente ya existe. Un nombre coincidente no verifica la identidad: pide un celular o correo guardado antes de reutilizar el perfil; si no coincide y los dos contactos nuevos están libres, permite crear otro cliente con ese nombre sin modificar el anterior.
- El bot debe pedir el dato de contacto faltante antes de confirmar una cita. Si un dato ya pertenece a otro cliente, no debe crear un registro duplicado; si celular y correo corresponden a clientes distintos, debe pedir que se corrijan.
- Toda lista numerada del bot debe indicar que se responde solo con el número de la opción; si la respuesta no es un número válido, debe aclararlo de nuevo. Los datos personales se responden con el dato solicitado.
- `getBookings({ date, barberId })`
- `createBooking({ clientId, barberId, serviceId, date, time })`
- `cancelBooking(id)`
- `blockSlot({ barberId, date, time })`
Guarda todo en localStorage (clave `yonder-barberia-db-v2`). Al primer arranque crea datos de ejemplo: 3 clientes (Carlos Pérez 3001234567 carlos@example.com, Andrés Gómez 3109876543 andres@example.com, Laura Restrepo 3128979997 laura@example.com) y citas ya reservadas solo para Yonder en los próximos 7 días, para que se vea la agenda con horas ocupadas.

## Lógica de agenda (`src/lib/availability.ts`)
- Cada servicio ocupa `ceil(duración / 30)` bloques de 30 minutos seguidos.
- Una hora de inicio es válida si el servicio termina antes del cierre del tramo (mañana o tarde).
- Si el barbero ya tiene una cita o bloqueo que se cruza con ese rango, esa hora NO aparece (se quita, no se muestra deshabilitada).
- Para hoy, no mostrar horas pasadas ni las de los próximos 30 minutos.
- Mostrar los próximos 14 días; un día sin horas libres aparece deshabilitado.

## Mensajes de WhatsApp simulados
- Cliente, 1 hora antes de la cita: "Hola {nombre}, te recordamos tu cita de hoy a las {hora} con Yonder ({servicio}). Te esperamos en {nombre del negocio}."
- Barbero, al reservar: "Nueva cita: {cliente} ({celular}) · {servicio} · {día} a las {hora}." (notificación para Yonder).
- La hora del recordatorio es la hora de la cita menos 60 minutos. Esto es solo una simulación visual, no se envía nada.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

## Datos de prueba

- El menú flotante "Demo" conserva "Reiniciar datos de ejemplo" y agrega debajo "Borrar datos de prueba".
- Borrar datos elimina únicamente los clientes, las citas y los bloqueos guardados en `yonder-barberia-db-v2`, y guarda `yb-seeded-v2 = "true"` para impedir que vuelvan a generarse datos de ejemplo al recargar. Esa bandera no debe borrar los datos nuevos que se guarden después.
- "Reiniciar datos de ejemplo" quita esa bandera y los datos guardados; al recargar se vuelven a crear los datos iniciales.
- La opción de borrar requiere dos toques dentro de cuatro segundos; luego recarga y muestra brevemente "Datos eliminados".
- Con los datos vacíos, las reservas y el registro de clientes siguen disponibles, el bot sigue funcionando y el panel indica "Aún no hay citas" sin ocultar las horas libres.
