import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "customer" | "staff" | "admin";

export type SessionUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  store_id: string | null;
};

/** Devuelve el usuario con su perfil, o null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, store_id")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: profile?.full_name ?? null,
    role: (profile?.role as Role) ?? "customer",
    store_id: profile?.store_id ?? null,
  };
}

/** Exige sesión con rol staff o admin; si no, redirige. */
export async function requireStaff(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect("/admin/login");
  if (u.role !== "staff" && u.role !== "admin") redirect("/admin/sin-acceso");
  return u;
}

/** Exige rol admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireStaff();
  if (u.role !== "admin") redirect("/admin/sin-acceso");
  return u;
}
