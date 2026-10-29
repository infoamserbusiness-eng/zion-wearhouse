"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toCents, slugify } from "@/lib/format";

export type IngresoState = { error: string | null };

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

function sameOptions(a: Record<string, string>, b: Record<string, string>): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k] === b[k]);
}

export async function registrarIngreso(
  _prev: IngresoState,
  formData: FormData,
): Promise<IngresoState> {
  const user = await requireStaff();
  const supabase = await createClient();

  const modo = String(formData.get("modo") ?? "nuevo");
  const qty = Math.trunc(Number(formData.get("cantidad")));
  const costCents = toCents(String(formData.get("costo") ?? "0"));
  const commission = Number(formData.get("comision") ?? 0) || 0;
  const pvpCents = toCents(String(formData.get("pvp") ?? "0"));
  const publicar = formData.get("publicar") === "on";
  const proveedor = String(formData.get("proveedor") ?? "").trim() || null;

  if (!Number.isFinite(qty) || qty <= 0) return { error: "La cantidad debe ser mayor a 0." };
  if (costCents <= 0) return { error: "El precio de compra debe ser mayor a 0." };
  if (pvpCents <= 0) return { error: "El PVP debe ser mayor a 0." };

  // Bodega principal
  const { data: warehouse } = await supabase
    .from("locations")
    .select("id")
    .eq("type", "warehouse")
    .order("position")
    .limit(1)
    .maybeSingle();
  if (!warehouse) return { error: "No hay una bodega principal registrada." };
  const locationId = warehouse.id;

  // ── Producto ────────────────────────────────────────────────
  let productId: string;

  if (modo === "existente") {
    productId = String(formData.get("producto_id") ?? "");
    if (!productId) return { error: "Selecciona un producto existente." };
  } else {
    const nombre = String(formData.get("nombre") ?? "").trim();
    const marca = String(formData.get("marca") ?? "").trim() || null;
    const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
    const categoriaId = String(formData.get("categoria_id") ?? "") || null;
    const subcategoriaId = String(formData.get("subcategoria_id") ?? "") || null;

    if (!nombre) return { error: "Escribe el nombre del producto." };
    if (!categoriaId) return { error: "Selecciona una categoría." };

    const slug = `${slugify(nombre) || "producto"}-${Date.now().toString(36).slice(-4)}`;
    const sku = `Z-${Date.now().toString(36).toUpperCase()}`;

    const { data: created, error: insErr } = await supabase
      .from("products")
      .insert({
        name: nombre,
        brand: marca,
        description: descripcion,
        category_id: categoriaId,
        subcategory_id: subcategoriaId,
        origin: "US",
        base_price_cents: pvpCents,
        avg_cost_cents: costCents,
        commission_pct: commission,
        status: publicar ? "active" : "draft",
        published_at: publicar ? new Date().toISOString() : null,
        created_by: user.id,
        sku,
        slug,
      })
      .select("id")
      .single();

    if (insErr || !created) return { error: `No se pudo crear el producto: ${insErr?.message ?? ""}` };
    productId = created.id;
  }

  // ── Variante ────────────────────────────────────────────────
  const opts: Record<string, string> = {};
  const talla = String(formData.get("talla") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  if (talla) opts.Talla = talla;
  if (color) opts.Color = color;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id,option_values_json")
    .eq("product_id", productId);

  let variantId: string | undefined = (variants ?? []).find((v) =>
    sameOptions((v.option_values_json as Record<string, string>) ?? {}, opts),
  )?.id;

  if (!variantId) {
    const { data: nv, error: vErr } = await supabase
      .from("product_variants")
      .insert({ product_id: productId, option_values_json: opts })
      .select("id")
      .single();
    if (vErr || !nv) return { error: `No se pudo crear la variante: ${vErr?.message ?? ""}` };
    variantId = nv.id;
  }

  // ── Foto (opcional) ─────────────────────────────────────────
  let photoPath: string | null = null;
  const foto = formData.get("foto");
  if (foto instanceof File && foto.size > 0) {
    const ext = EXT_BY_TYPE[foto.type] ?? "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, foto, { contentType: foto.type || "image/jpeg", upsert: false });
    if (!upErr) {
      photoPath = path;
      await supabase.from("product_images").insert({ product_id: productId, storage_path: path });
    }
  }

  // ── Compra ──────────────────────────────────────────────────
  const { data: purchase, error: pErr } = await supabase
    .from("purchases")
    .insert({
      variant_id: variantId,
      location_id: locationId,
      qty,
      unit_cost_cents: costCents,
      pvp_cents: pvpCents,
      commission_pct: commission,
      supplier_ref: proveedor,
      photo_path: photoPath,
      received_by: user.id,
    })
    .select("id")
    .single();
  if (pErr || !purchase) return { error: `No se pudo registrar la compra: ${pErr?.message ?? ""}` };

  // ── Inventario ──────────────────────────────────────────────
  const { data: existing } = await supabase
    .from("inventory")
    .select("qty")
    .eq("location_id", locationId)
    .eq("variant_id", variantId)
    .maybeSingle();

  const { error: invErr } = await supabase
    .from("inventory")
    .upsert(
      { location_id: locationId, variant_id: variantId, qty: (existing?.qty ?? 0) + qty },
      { onConflict: "location_id,variant_id" },
    );
  if (invErr) return { error: `No se pudo actualizar el inventario: ${invErr.message}` };

  await supabase.from("inventory_movements").insert({
    location_id: locationId,
    variant_id: variantId,
    delta: qty,
    reason: "purchase",
    ref: purchase.id,
    created_by: user.id,
  });

  // ── Recalcular costo promedio + PVP del producto ────────────
  const variantIds = (variants ?? []).map((v) => v.id);
  if (!variantIds.includes(variantId)) variantIds.push(variantId);

  const { data: allPurchases } = await supabase
    .from("purchases")
    .select("qty,unit_cost_cents")
    .in("variant_id", variantIds);

  let totalQty = 0;
  let totalCost = 0;
  for (const r of allPurchases ?? []) {
    totalQty += r.qty ?? 0;
    totalCost += (r.qty ?? 0) * (r.unit_cost_cents ?? 0);
  }
  const avgCost = totalQty > 0 ? Math.round(totalCost / totalQty) : costCents;

  const patch: {
    avg_cost_cents: number;
    base_price_cents: number;
    commission_pct: number;
    status?: "active";
    published_at?: string;
  } = {
    avg_cost_cents: avgCost,
    base_price_cents: pvpCents,
    commission_pct: commission,
  };
  if (publicar) {
    patch.status = "active";
    patch.published_at = new Date().toISOString();
  }
  await supabase.from("products").update(patch).eq("id", productId);

  revalidatePath("/admin/inventario");
  redirect("/admin/inventario");
}
