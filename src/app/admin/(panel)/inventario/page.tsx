import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { money, marginPct } from "@/lib/format";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  brand: string | null;
  sku: string | null;
  base_price_cents: number;
  avg_cost_cents: number;
  commission_pct: number;
  status: "draft" | "active" | "archived";
  category: { name: string } | { name: string }[] | null;
  subcategory: { name: string } | { name: string }[] | null;
};

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

const STATUS_LABEL: Record<Row["status"], string> = {
  active: "Publicado",
  draft: "Borrador",
  archived: "Archivado",
};

export default async function InventarioPage() {
  const supabase = await createClient();

  const [{ data: productsData, error: pErr }, { data: locations }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id,name,brand,sku,base_price_cents,avg_cost_cents,commission_pct,status,category:categories(name),subcategory:subcategories(name)",
      )
      .order("name"),
    supabase.from("locations").select("id,name,short_name,type").order("position"),
  ]);

  const products = (productsData ?? []) as Row[];
  const warehouseIds = (locations ?? []).filter((l) => l.type === "warehouse").map((l) => l.id);

  const stockByProduct = new Map<string, number>();
  if (warehouseIds.length) {
    const { data: inv } = await supabase
      .from("inventory")
      .select("qty,variant:product_variants(product_id)")
      .in("location_id", warehouseIds);
    for (const r of inv ?? []) {
      const pid = one(r.variant as { product_id: string } | { product_id: string }[] | null)?.product_id;
      if (pid) stockByProduct.set(pid, (stockByProduct.get(pid) ?? 0) + (r.qty ?? 0));
    }
  }

  const warehouseName =
    (locations ?? []).find((l) => l.type === "warehouse")?.short_name ??
    (locations ?? []).find((l) => l.type === "warehouse")?.name ??
    "Bodega";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl">Inventario y bodegas</h1>
          <p className="mt-1 text-[13px] text-[var(--text-soft)]">
            Catálogo maestro y stock en {warehouseName}. {products.length} producto
            {products.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/admin/inventario/nuevo" className="zbtn zbtn-gold">
          Registrar ingreso
        </Link>
      </div>

      {pErr && (
        <p className="zcard mt-6 p-4 text-[13px]" style={{ color: "var(--danger)" }}>
          No se pudo cargar el inventario: {pErr.message}
        </p>
      )}

      {!pErr && products.length === 0 && (
        <div className="zcard mt-6 p-8 text-center">
          <p className="text-[15px]">Todavía no hay productos.</p>
          <p className="mt-1 text-[13px] text-[var(--text-soft)]">
            Usa “Registrar ingreso” para cargar la mercadería que llega a la bodega principal.
          </p>
          <Link href="/admin/inventario/nuevo" className="zbtn zbtn-ink mt-5 inline-flex">
            Registrar el primer ingreso
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="zcard mt-6 overflow-x-auto">
          <table className="ztable">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th className="znum">Costo</th>
                <th className="znum">PVP</th>
                <th className="znum">Margen</th>
                <th className="znum">% Com.</th>
                <th className="znum">Stock</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cat = one(p.category)?.name;
                const sub = one(p.subcategory)?.name;
                const stock = stockByProduct.get(p.id) ?? 0;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] text-[var(--text-soft)]">
                        {p.brand ? `${p.brand} · ` : ""}
                        {p.sku ?? "sin SKU"}
                      </div>
                    </td>
                    <td className="text-[12px]">
                      {cat ?? "—"}
                      {sub ? <span className="text-[var(--text-soft)]"> / {sub}</span> : null}
                    </td>
                    <td className="znum">{money(p.avg_cost_cents)}</td>
                    <td className="znum">{money(p.base_price_cents)}</td>
                    <td className="znum">{marginPct(p.base_price_cents, p.avg_cost_cents)}%</td>
                    <td className="znum">{Number(p.commission_pct)}%</td>
                    <td className="znum">{stock}</td>
                    <td>
                      <span className={`zpill ${p.status === "active" ? "zpill-ok" : "zpill-off"}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
