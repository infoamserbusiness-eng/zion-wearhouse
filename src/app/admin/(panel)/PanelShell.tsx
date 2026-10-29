"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/auth";

type Section = {
  href: string;
  label: string;
  ready: boolean;
  roles: Role[];
};

const SECTIONS: Section[] = [
  { href: "/admin/inventario", label: "Inventario y bodegas", ready: true, roles: ["staff", "admin"] },
  { href: "/admin/pedidos", label: "Pedidos online", ready: false, roles: ["admin"] },
  { href: "/admin/menu", label: "Menú de la tienda", ready: false, roles: ["admin"] },
  { href: "/admin/facturacion", label: "Facturación", ready: false, roles: ["admin"] },
  { href: "/admin/descuentos", label: "Descuentos", ready: false, roles: ["admin"] },
  { href: "/admin/partners", label: "Productos de partners", ready: false, roles: ["admin"] },
  { href: "/admin/tiendas", label: "Tiendas físicas", ready: false, roles: ["admin"] },
  { href: "/admin/cajas", label: "Cajas y ventas del día", ready: false, roles: ["staff", "admin"] },
  { href: "/admin/traspasos", label: "Traspasos", ready: false, roles: ["staff", "admin"] },
  { href: "/admin/clientes", label: "Clientes y marketing", ready: false, roles: ["admin"] },
  { href: "/admin/usuarios", label: "Usuarios y roles", ready: false, roles: ["admin"] },
];

export default function PanelShell({
  role,
  name,
  email,
  children,
}: {
  role: Role;
  name: string | null;
  email: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = SECTIONS.filter((s) => s.roles.includes(role));

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map((s) => {
        const active = pathname === s.href || pathname.startsWith(s.href + "/");
        if (!s.ready) {
          return (
            <span
              key={s.href}
              className="flex items-center justify-between rounded px-3 py-2 text-[13px]"
              style={{ color: "var(--on-ink-soft)", opacity: 0.55 }}
            >
              {s.label}
              <span className="zpill" style={{ background: "rgba(244,235,218,0.1)", color: "var(--on-ink-soft)" }}>
                Pronto
              </span>
            </span>
          );
        }
        return (
          <Link
            key={s.href}
            href={s.href}
            onClick={() => setOpen(false)}
            className="rounded px-3 py-2 text-[13px] transition-colors"
            style={{
              background: active ? "rgba(198,154,70,0.16)" : "transparent",
              color: active ? "var(--gold-bright)" : "var(--on-ink)",
              fontWeight: active ? 600 : 400,
            }}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row" style={{ background: "var(--ground)" }}>
      {/* Barra superior móvil */}
      <header
        className="md:hidden flex items-center justify-between px-4 py-3"
        style={{ background: "var(--ink)", color: "var(--on-ink)" }}
      >
        <span className="text-[11px] tracking-[0.24em] uppercase" style={{ color: "var(--gold-bright)" }}>
          ZION · Panel
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="zbtn zbtn-sm"
          style={{ borderColor: "rgba(244,235,218,0.24)", color: "var(--on-ink)" }}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${open ? "block" : "hidden"} md:block md:w-64 md:shrink-0 md:min-h-full px-3 py-5`}
        style={{ background: "var(--ink)", color: "var(--on-ink)" }}
      >
        <div className="hidden md:block px-3 pb-5">
          <p className="text-[11px] tracking-[0.24em] uppercase" style={{ color: "var(--gold-bright)" }}>
            ZION Wear House
          </p>
          <p className="mt-1 text-[11px]" style={{ color: "var(--on-ink-soft)" }}>
            Panel interno
          </p>
        </div>
        {nav}
        <div
          className="mt-6 border-t px-3 pt-4 text-[12px]"
          style={{ borderColor: "rgba(244,235,218,0.12)", color: "var(--on-ink-soft)" }}
        >
          <p className="truncate" style={{ color: "var(--on-ink)" }}>
            {name || email}
          </p>
          <p className="mt-0.5 capitalize">{role === "admin" ? "Administrador" : "Staff"}</p>
          <Link href="/admin/logout" className="mt-3 inline-block underline" style={{ color: "var(--on-ink-soft)" }}>
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
