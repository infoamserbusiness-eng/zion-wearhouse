"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type LoginState } from "./actions";

const initial: LoginState = { error: null };

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <p className="text-[11px] tracking-[0.28em] uppercase" style={{ color: "var(--gold-bright)" }}>
          ZION Wear House
        </p>
        <h1 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--on-ink)" }}>
          Panel interno
        </h1>
      </div>

      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label className="zlabel" style={{ color: "var(--on-ink-soft)" }} htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="zinput"
            style={{ background: "rgba(244,235,218,0.06)", borderColor: "rgba(244,235,218,0.22)", color: "var(--on-ink)" }}
          />
        </div>

        <div>
          <label className="zlabel" style={{ color: "var(--on-ink-soft)" }} htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="zinput"
            style={{ background: "rgba(244,235,218,0.06)", borderColor: "rgba(244,235,218,0.22)", color: "var(--on-ink)" }}
          />
        </div>

        {state.error && (
          <p className="text-[13px]" style={{ color: "#e79a8f" }}>
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="zbtn zbtn-gold w-full">
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main
      className="flex-1 grid place-items-center px-6 py-16"
      style={{ background: "var(--ink)", color: "var(--on-ink)" }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
