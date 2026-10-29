import Link from "next/link";

export default function SinAcceso() {
  return (
    <main
      className="flex-1 grid place-items-center px-6 py-16 text-center"
      style={{ background: "var(--ink)", color: "var(--on-ink)" }}
    >
      <div className="max-w-md">
        <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--on-ink)" }}>
          Sin acceso
        </h1>
        <p className="mt-3 text-[14px]" style={{ color: "var(--on-ink-soft)" }}>
          Tu cuenta no tiene permisos para el panel interno de ZION. Si crees que es un error,
          contacta al administrador.
        </p>
        <Link
          href="/admin/logout"
          className="zbtn zbtn-ghost mt-8 inline-flex"
          style={{ borderColor: "rgba(244,235,218,0.18)", color: "var(--on-ink)" }}
        >
          Cerrar sesión
        </Link>
      </div>
    </main>
  );
}
