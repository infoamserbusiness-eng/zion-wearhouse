"use client";

import { useActionState, useMemo, useState } from "react";
import { registrarIngreso, type IngresoState } from "./actions";

type Cat = { id: string; slug: string; name: string };
type Sub = { id: string; category_id: string; name: string };
type Prod = { id: string; name: string; brand: string | null };

const APPAREL = new Set(["mujer", "hombre", "ninos", "calzado"]);
const initial: IngresoState = { error: null };

export default function IngresoForm({
  categories,
  subcategories,
  products,
}: {
  categories: Cat[];
  subcategories: Sub[];
  products: Prod[];
}) {
  const [state, formAction, pending] = useActionState(registrarIngreso, initial);

  const [modo, setModo] = useState<"nuevo" | "existente">(products.length ? "existente" : "nuevo");
  const [categoriaId, setCategoriaId] = useState("");
  const [costo, setCosto] = useState("");
  const [comision, setComision] = useState("0");
  const [pvp, setPvp] = useState("");
  const [pvpTouched, setPvpTouched] = useState(false);

  const catSlug = categories.find((c) => c.id === categoriaId)?.slug ?? "";
  const isApparel = modo === "existente" || APPAREL.has(catSlug);
  const subsForCat = useMemo(
    () => subcategories.filter((s) => s.category_id === categoriaId),
    [subcategories, categoriaId],
  );

  const autoPvp = useMemo(() => {
    const c = parseFloat(costo.replace(",", "."));
    const k = parseFloat(comision.replace(",", ".")) || 0;
    if (!Number.isFinite(c) || c <= 0) return "";
    return (c * (1 + k / 100)).toFixed(2);
  }, [costo, comision]);

  const shownPvp = pvpTouched ? pvp : autoPvp;

  return (
    <form action={formAction} className="mt-6 space-y-6">
      {products.length > 0 && (
        <div className="zcard p-4">
          <span className="zlabel">Tipo de ingreso</span>
          <div className="flex gap-4 text-[14px]">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="modo"
                value="existente"
                checked={modo === "existente"}
                onChange={() => setModo("existente")}
              />
              Producto existente
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="modo"
                value="nuevo"
                checked={modo === "nuevo"}
                onChange={() => setModo("nuevo")}
              />
              + Producto nuevo
            </label>
          </div>
        </div>
      )}
      {products.length === 0 && <input type="hidden" name="modo" value="nuevo" />}

      {modo === "existente" ? (
        <div className="zcard p-4">
          <label className="zlabel" htmlFor="producto_id">
            Producto
          </label>
          <select id="producto_id" name="producto_id" required className="zselect" defaultValue="">
            <option value="" disabled>
              Selecciona…
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.brand ? ` — ${p.brand}` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="zcard space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="zlabel" htmlFor="nombre">
                Nombre del producto
              </label>
              <input id="nombre" name="nombre" required className="zinput" />
            </div>
            <div>
              <label className="zlabel" htmlFor="marca">
                Marca
              </label>
              <input id="marca" name="marca" className="zinput" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="zlabel" htmlFor="categoria_id">
                Categoría
              </label>
              <select
                id="categoria_id"
                name="categoria_id"
                required
                className="zselect"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="" disabled>
                  Selecciona…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="zlabel" htmlFor="subcategoria_id">
                Subcategoría
              </label>
              <select
                id="subcategoria_id"
                name="subcategoria_id"
                className="zselect"
                disabled={!categoriaId}
                defaultValue=""
              >
                <option value="">— Sin subcategoría —</option>
                {subsForCat.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="zlabel" htmlFor="descripcion">
              Descripción
            </label>
            <textarea id="descripcion" name="descripcion" className="ztextarea" />
          </div>
        </div>
      )}

      {/* Variante */}
      {isApparel && (
        <div className="zcard grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <label className="zlabel" htmlFor="talla">
              Talla
            </label>
            <input id="talla" name="talla" className="zinput" placeholder="Opcional" />
          </div>
          <div>
            <label className="zlabel" htmlFor="color">
              Color
            </label>
            <input id="color" name="color" className="zinput" placeholder="Opcional" />
          </div>
        </div>
      )}

      {/* Costos */}
      <div className="zcard space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="zlabel" htmlFor="cantidad">
              Cantidad
            </label>
            <input
              id="cantidad"
              name="cantidad"
              type="number"
              min={1}
              step={1}
              required
              className="zinput"
            />
          </div>
          <div>
            <label className="zlabel" htmlFor="costo">
              Precio de compra (unit.)
            </label>
            <input
              id="costo"
              name="costo"
              inputMode="decimal"
              required
              className="zinput"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="zlabel" htmlFor="comision">
              % de comisión
            </label>
            <input
              id="comision"
              name="comision"
              inputMode="decimal"
              className="zinput"
              value={comision}
              onChange={(e) => setComision(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="zlabel" htmlFor="pvp">
              PVP (calculado: {autoPvp || "—"})
            </label>
            <input
              id="pvp"
              name="pvp"
              inputMode="decimal"
              required
              className="zinput"
              value={shownPvp}
              onChange={(e) => {
                setPvpTouched(true);
                setPvp(e.target.value);
              }}
              placeholder="0.00"
            />
            {pvpTouched && (
              <button
                type="button"
                className="mt-1 text-[11px] underline text-[var(--text-soft)]"
                onClick={() => {
                  setPvpTouched(false);
                  setPvp("");
                }}
              >
                Volver al PVP calculado
              </button>
            )}
          </div>
          <div>
            <label className="zlabel" htmlFor="proveedor">
              Referencia de proveedor
            </label>
            <input id="proveedor" name="proveedor" className="zinput" placeholder="Opcional" />
          </div>
        </div>
      </div>

      {/* Foto + publicar */}
      <div className="zcard space-y-4 p-4">
        <div>
          <label className="zlabel" htmlFor="foto">
            Foto del producto
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/*"
            className="text-[13px]"
          />
        </div>
        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" name="publicar" />
          Publicar en la tienda al guardar
        </label>
      </div>

      {state.error && (
        <p className="text-[13px]" style={{ color: "var(--danger)" }}>
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="zbtn zbtn-gold">
          {pending ? "Guardando…" : "Guardar ingreso"}
        </button>
      </div>
    </form>
  );
}
