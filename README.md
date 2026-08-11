# Leph · MaatH

Sistema de reputación bidireccional para alquileres (inquilinos ↔ propietarios/inmobiliarias),
enfocado en zonas turísticas de alta demanda. Primera zona activa: Bariloche.

**Producción:** https://leph-maath-leph.vercel.app
**Backend:** Supabase (proyecto `kjvuhgmkpiewtuqzyjjl`, región sa-east-1)

---

## Qué hace

- **Consultar** (público, sin login): buscar reportes por nombre, teléfono o dirección.
- **Reportar** (requiere login): cargar un reporte sobre un inquilino, propietario o
  inmobiliaria, con motivo, descripción y evidencia opcional (fotos/PDF).
- **Corroborar** (requiere login): confirmar de forma independiente un reporte existente.
  2+ corroboraciones → el reporte pasa a `verificado`.
- **Descargo** (requiere login): el/la acusado/a puede presentar su versión antes de que
  se confirme el reporte.

## Seguridad / privacidad

- Ningún dato personal (nombre, teléfono, dirección) se guarda en texto plano — todo se
  hashea con HMAC-SHA256 usando una clave guardada en Supabase Vault.
- RLS (Row Level Security) activo en las 3 tablas principales (`reportes`,
  `corroboraciones`, `descargos`). Solo se puede escribir a través de las funciones RPC
  (`security definer`); el cliente nunca hace INSERT/UPDATE directo.
- Autenticación por magic link (email, sin contraseña) vía Supabase Auth. La identidad del
  reportante es `auth.uid()`, no un dato que el usuario tipea.
- Bucket de evidencia (`evidencias-maath`) privado, solo accesible para usuarios
  autenticados.

## Modelo de negocio

- **Trial gratis de 7 días** desde el primer login: se puede reportar, corroborar y dar
  descargos sin costo.
- Pasado ese plazo, hay que **activar la cuenta** para seguir escribiendo. **Consultar
  siempre es gratis**, sin login ni límite de tiempo — es lo que le da valor de red al
  sistema.
- El pago hoy se marca **manualmente** vía SQL (`select marcar_pago('<user_id>');`) hasta
  integrar una pasarela automática.

## Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4, estética Leph (dorado/violeta,
  fondo oscuro, ⟁).
- **Backend:** Supabase (Postgres + Auth + Storage + Vault).
- **Deploy:** Vercel, proyecto `leph-maath`, org `leph`.

## Estructura del backend (tablas)

- `reportes` — reporte principal, hashes de búsqueda + metadata.
- `corroboraciones` — corroboraciones independientes por reporte.
- `descargos` — respuestas del acusado.
- `perfiles` — trial/estado de pago por usuario.

## Funciones RPC

| Función | Qué hace | Requiere login |
|---|---|---|
| `consultar_reporte(persona, telefono, direccion, zona)` | Busca reportes | No |
| `crear_reporte(...)` | Crea un reporte | Sí (+ trial vigente o pago) |
| `corroborar_reporte(reporte_id, comentario)` | Corrobora un reporte | Sí (+ trial vigente o pago) |
| `presentar_descargo(reporte_id, texto, evidencia)` | Presenta un descargo | Sí (+ trial vigente o pago) |
| `mi_estado_cuenta()` | Devuelve trial/pago del usuario logueado | Sí |
| `marcar_pago(user_id, pago_hasta?)` | Activa el pago de un usuario (uso admin/manual) | — |

## Pendiente

- **Pago automático (Mercado Pago).** Requiere Access Token de una cuenta de developers
  de Mercado Pago (https://www.mercadopago.com.ar/developers/panel/app). Con eso se arma
  el checkout + webhook que llama a `marcar_pago()` solo.
- Extensión de navegador para detectar nombres/teléfonos reportados en Facebook
  Marketplace / WhatsApp Web en tiempo real (fase 2, post-integración con Leph Maat).
- Integración con Leph Maat (compraventa) cuando ese proyecto esté cerrado.

## Zep

El schema SQL completo vive en `schema.sql` en la raíz de este repo (no está en el
código del frontend porque se aplica directo vía Supabase).
