# Leph · MaatH

Sistema de reputación bidireccional para alquileres (inquilinos ↔ propietarios/inmobiliarias),
enfocado en zonas turísticas de alta demanda. Primera zona activa: Bariloche.

**Producción:** https://leph-maath.vercel.app
**Backend:** Supabase (proyecto `kjvuhgmkpiewtuqzyjjl`, región sa-east-1)

---

## Qué hace

- **Consultar** (público, sin login): buscar reportes por nombre, teléfono o dirección.
  3 consultas gratis por dispositivo; después, plan pago.
- **Reportar** (requiere login): cargar un reporte con motivo, descripción y evidencia
  opcional (fotos/PDF).
- **Corroborar** (requiere login): confirmar de forma independiente un reporte existente.
  2+ corroboraciones → el reporte pasa a `verificado`.
- **Descargo** (requiere login): el/la acusado/a puede presentar su versión antes de que
  se confirme el reporte.

## Modelo de negocio

- **Consultar**: 3 gratis por dispositivo (localStorage). Al agotarse, se ofrece Informe
  Único ($3.000 ARS, 24hs de acceso completo) o plan Pro ($6.000 ARS/mes, ilimitado).
- **Reportar/Corroborar/Descargo**: 7 días de trial gratis desde el primer login. Pasado
  ese plazo, requiere el mismo plan pago (Informe Único o Pro).
- **Inmobiliarias**: visible en el pricing como "próximamente", sin lógica real (solo un
  mailto de contacto).
- Pagos procesados con **Mercado Pago (Checkout Pro)**, activación 100% automática vía
  webhook — no requiere intervención manual.

## Seguridad / privacidad

- Ningún dato personal (nombre, teléfono, dirección) se guarda en texto plano — todo se
  hashea con HMAC-SHA256 usando una clave guardada en Supabase Vault.
- RLS activo en las 3 tablas principales. Solo se escribe vía funciones RPC
  (`security definer`); el cliente nunca hace INSERT/UPDATE directo.
- Autenticación por magic link (email, sin contraseña) vía Supabase Auth. La identidad del
  reportante es `auth.uid()`.
- El Access Token de Mercado Pago vive en Vault, nunca en el código del cliente.
  `marcar_pago()` solo es ejecutable por `service_role` (o sea, solo desde el webhook).
- Bucket de evidencia (`evidencias-maath`) privado, solo accesible para usuarios
  autenticados.

## Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4, estética Leph.
- **Backend:** Supabase (Postgres + Auth + Storage + Vault + Edge Functions).
- **Pagos:** Mercado Pago Checkout Pro.
- **Deploy:** Vercel, proyecto `leph-maath`, org `leph`.

## Edge Functions (Supabase)

| Función | verify_jwt | Qué hace |
|---|---|---|
| `crear-pago` | true | Genera preferencia de pago en MP según `{ plan }` recibido |
| `pago-webhook` | false | Notification URL de MP; verifica el pago real contra la API de MP y activa la cuenta |

**URL del webhook** (cargada en el panel de Mercado Pago → Notificaciones → Pagos):
```
https://kjvuhgmkpiewtuqzyjjl.supabase.co/functions/v1/pago-webhook
```

## Funciones RPC (Postgres)

| Función | Qué hace | Acceso |
|---|---|---|
| `consultar_reporte(...)` | Busca reportes | Público |
| `crear_reporte(...)` | Crea un reporte | Login + trial/plan activo |
| `corroborar_reporte(...)` | Corrobora un reporte | Login + trial/plan activo |
| `presentar_descargo(...)` | Presenta un descargo | Login + trial/plan activo |
| `mi_estado_cuenta()` | Trial/pago del usuario logueado | Login |
| `marcar_pago(user_id, plan)` | Activa el pago de un usuario | Solo `service_role` (webhook) |
| `obtener_token_mp()` | Devuelve el Access Token de MP desde Vault | Solo `service_role` |

## Configuración de Supabase Auth (dashboard, no vía SQL)

- **Site URL:** `https://leph-maath.vercel.app`
- **Redirect URLs:** `https://leph-maath.vercel.app/**`

## Pendiente

- Extensión de navegador para detectar nombres/teléfonos reportados en Facebook
  Marketplace / WhatsApp Web en tiempo real (fase 2, post-integración con Leph Maat).
- Integración con Leph Maat (compraventa) cuando ese proyecto esté cerrado.
- Plan Inmobiliarias: falta lógica real (multipropiedad, multiusuario).
- El contador de 3 consultas gratis vive en `localStorage`; alguien que borre caché o
  use incógnito lo resetea. Si se abusa, migrar a conteo por usuario autenticado.

## Zep

El schema SQL completo (incluye historial de todas las migraciones aplicadas) vive en
`schema.sql` en la raíz de este repo.
