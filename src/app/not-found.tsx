import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-container flex min-h-[60vh] flex-1 flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold uppercase text-foreground">
        Página no encontrada
      </h1>
      <p className="mt-4 max-w-md text-muted">
        La página que buscas no existe o ya no está disponible.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 font-semibold text-background transition-colors hover:bg-[#e2bb72]"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
