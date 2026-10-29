# ZION Wear House — plataforma

App Next.js 16 (App Router) + Supabase + Vercel.
Fase 0: panel interno de inventario. La tienda pública está oculta tras “Próximamente”.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y completa los valores
npm run dev -- -p 3020
```

- `http://localhost:3020` → página “Próximamente”.
- `http://localhost:3020/admin` → panel (pide login).

> Nunca correr `npm install` sobre Google Drive. El repo de trabajo vive en
> `C:\Users\USUARIO\dev\zion`.

## Variables de entorno

| Variable | Dónde se usa | Notas |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | cliente + servidor | Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente + servidor | anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo servidor** | Project Settings → API → `service_role`. Nunca al navegador ni al repo. |
| `NEXT_PUBLIC_STORE_LIVE` | cliente | `false` mantiene la tienda oculta. Cámbialo a `true` sólo para lanzar. |
| `NEXT_PUBLIC_SITE_NAME` | cliente | `ZION Wear House` |

## Base de datos

Migraciones en `supabase/migrations/` (ya aplicadas al proyecto `rflboojtpmdaerbgrmdl`):

1. `0001_core.sql` — perfiles, ubicaciones, settings, RLS base.
2. `0002_catalog_inventory.sql` — catálogo, variantes, inventario, compras, traspasos, POS, caja.
3. `0003_storage_policies.sql` — bucket `product-images`.

### Crear el primer administrador

1. Dashboard de Supabase → Authentication → Users → **Add user** (con contraseña).
2. En el SQL editor:

   ```sql
   update public.profiles
   set role = 'admin', is_active = true
   where id = (select id from auth.users where email = 'TU_CORREO');
   ```

3. Ya puedes entrar a `/admin`.

Para un vendedor de tienda física: `role = 'staff'` y `store_id` = id de su tienda
(`select id, name from public.locations where type = 'store'`).

## Deploy a Vercel (privado)

1. `vercel` → import del repo `zion`.
2. Environment Variables: las 5 de la tabla (con `NEXT_PUBLIC_STORE_LIVE=false`).
3. Deploy. La raíz muestra “Próximamente”; `/admin` funciona con login.
4. Para lanzar la tienda al público: cambia `NEXT_PUBLIC_STORE_LIVE=true` y vuelve a desplegar.

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Próximamente (o tienda si `STORE_LIVE=true`) |
| `/admin/login` | Login del panel |
| `/admin` | Redirige a `/admin/inventario` |
| `/admin/inventario` | Catálogo maestro + stock en bodega |
| `/admin/inventario/nuevo` | Registrar ingreso a bodega (costo, % comisión, PVP, foto, publicar) |
| `/admin/logout` | Cierra sesión |
