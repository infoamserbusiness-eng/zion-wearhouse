import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import IngresoForm from "./IngresoForm";

export const dynamic = "force-dynamic";

export default async function NuevoIngresoPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: subcategories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id,slug,name").eq("is_active", true).order("position"),
    supabase.from("subcategories").select("id,category_id,name").order("position"),
    supabase.from("products").select("id,name,brand").order("name"),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl">Registrar ingreso a bodega</h1>
        <Link href="/admin/inventario" className="zbtn zbtn-ghost zbtn-sm">
          Volver
        </Link>
      </div>
      <p className="mt-1 text-[13px] text-[var(--text-soft)]">
        Carga la mercadería que llega a la bodega principal. El PVP se calcula con el costo y el
        porcentaje de comisión, y puedes ajustarlo a mano.
      </p>

      <IngresoForm
        categories={categories ?? []}
        subcategories={subcategories ?? []}
        products={products ?? []}
      />
    </div>
  );
}
