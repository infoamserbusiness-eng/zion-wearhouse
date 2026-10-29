import Link from "next/link";

export default function ComingSoon() {
  const live = process.env.NEXT_PUBLIC_STORE_LIVE === "true";

  if (live) {
    return (
      <main className="flex-1 grid place-items-center p-8">
        <p className="text-[var(--text-soft)]">Tienda en construcción.</p>
      </main>
    );
  }

  return (
    <main
      className="flex-1 grid place-items-center px-6 py-16 text-center"
      style={{ background: "var(--ink)", color: "var(--on-ink)" }}
    >
      <div className="max-w-lg">
        <p className="text-[11px] tracking-[0.24em] uppercase" style={{ color: "var(--gold-bright)" }}>
          Próximamente
        </p>
        <h1
          className="mt-4 text-4xl sm:text-5xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.18em", color: "var(--gold-bright)" }}
        >
          ZION
        </h1>
        <p className="mt-1 text-[10px] tracking-[0.34em] uppercase" style={{ color: "var(--on-ink-soft)" }}>
          Wear&nbsp;House
        </p>
        <p className="mt-8 text-[15px]" style={{ color: "var(--on-ink-soft)" }}>
          Estamos preparando la tienda. Producto americano importado, entregado en todo el
          Ecuador. Vuelve pronto.
        </p>
        <Link
          href="/admin"
          className="zbtn zbtn-ghost mt-10 inline-flex"
          style={{ borderColor: "rgba(244,235,218,0.18)", color: "var(--on-ink)" }}
        >
          Acceso al panel
        </Link>
      </div>
    </main>
  );
}
