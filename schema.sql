-- ============================================================
-- LEPH - MAATH
-- Sistema de reputación bidireccional para alquileres
-- (inquilinos <-> propietarios/inmobiliarias), enfocado en
-- zonas turísticas de alta demanda (Bariloche primero).
--
-- Basado en el patrón de Leph Maat:
-- - Nunca se guarda PII cruda, solo hashes HMAC-SHA256 vía Vault
-- - Corroboración comunitaria (2+ reportes independientes = verificado)
-- - Descargo: el/la acusado/a puede responder antes de confirmarse
-- ============================================================

-- Extensión necesaria para HMAC
create extension if not exists pgsodium;

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------

create type rol_reportado as enum ('inquilino', 'propietario', 'inmobiliaria');

create type estado_reporte as enum (
  'pendiente',
  'en_disputa',
  'verificado',
  'descartado'
);

create type tipo_target as enum ('persona', 'telefono', 'direccion');

-- ------------------------------------------------------------
-- TABLA PRINCIPAL: reportes
-- Un reporte puede tener persona + teléfono + dirección a la vez
-- (no excluyentes). Cada campo presente se hashea por separado
-- para permitir búsqueda cruzada.
-- ------------------------------------------------------------

create table reportes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Rol de a quién se reporta
  rol rol_reportado not null,

  -- Hashes de búsqueda (HMAC-SHA256 vía Vault, nunca texto plano)
  persona_hash text,       -- nombre completo normalizado (lowercase, sin tildes)
  telefono_hash text,      -- solo dígitos, con código de país normalizado
  direccion_hash text,     -- dirección normalizada (calle+altura+localidad)

  -- Zona (para filtrar por Bariloche, y escalar a otras zonas turísticas después)
  zona text not null default 'bariloche',

  -- Contenido del reporte
  motivo text not null,              -- categoría corta (ej: "no devolvió depósito")
  descripcion text not null,         -- detalle libre
  evidencia_paths text[],            -- rutas en el bucket privado "evidencias"

  -- Estado y corroboración
  estado estado_reporte not null default 'pendiente',
  corroboraciones int not null default 0,

  -- Quien reporta (hash del reportante, no se expone públicamente)
  reportante_hash text not null,

  constraint al_menos_un_target check (
    persona_hash is not null or telefono_hash is not null or direccion_hash is not null
  )
);

create index idx_reportes_persona on reportes (persona_hash);
create index idx_reportes_telefono on reportes (telefono_hash);
create index idx_reportes_direccion on reportes (direccion_hash);
create index idx_reportes_zona on reportes (zona);
create index idx_reportes_estado on reportes (estado);

-- ------------------------------------------------------------
-- CORROBORACIONES
-- Reportes independientes adicionales sobre el mismo target.
-- 2+ corroboraciones de reportantes distintos => verificado.
-- ------------------------------------------------------------

create table corroboraciones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reporte_id uuid not null references reportes(id) on delete cascade,
  reportante_hash text not null,
  comentario text,
  unique (reporte_id, reportante_hash)
);

-- ------------------------------------------------------------
-- DESCARGOS
-- El acusado puede presentar su versión antes de que se confirme.
-- ------------------------------------------------------------

create table descargos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reporte_id uuid not null references reportes(id) on delete cascade,
  texto text not null,
  evidencia_paths text[]
);

-- ------------------------------------------------------------
-- FUNCIONES PÚBLICAS (RPC)
-- ------------------------------------------------------------

-- Hashea un valor usando el secreto guardado en Vault
create or replace function _hmac(valor text)
returns text
language plpgsql
security definer
set search_path = extensions, vault, public
as $$
declare
  secreto text;
begin
  select decrypted_secret into secreto
  from vault.decrypted_secrets
  where name = 'maath_hmac_key';

  return encode(hmac(lower(trim(valor)), secreto, 'sha256'), 'hex');
end;
$$;

-- Consulta pública: busca por persona, teléfono o dirección (al menos uno)
create or replace function consultar_reporte(
  p_persona text default null,
  p_telefono text default null,
  p_direccion text default null,
  p_zona text default null
)
returns table (
  id uuid,
  created_at timestamptz,
  rol rol_reportado,
  zona text,
  motivo text,
  descripcion text,
  estado estado_reporte,
  corroboraciones int
)
language plpgsql
security definer
set search_path = extensions, vault, public
as $$
begin
  return query
  select r.id, r.created_at, r.rol, r.zona, r.motivo, r.descripcion, r.estado, r.corroboraciones
  from reportes r
  where
    (p_persona is not null and r.persona_hash = _hmac(p_persona))
    or (p_telefono is not null and r.telefono_hash = _hmac(regexp_replace(p_telefono, '\D', '', 'g')))
    or (p_direccion is not null and r.direccion_hash = _hmac(p_direccion))
  and (p_zona is null or r.zona = p_zona)
  order by r.created_at desc;
end;
$$;

-- Crear reporte
create or replace function crear_reporte(
  p_rol rol_reportado,
  p_motivo text,
  p_descripcion text,
  p_reportante_id text,
  p_persona text default null,
  p_telefono text default null,
  p_direccion text default null,
  p_zona text default 'bariloche',
  p_evidencia_paths text[] default null
)
returns uuid
language plpgsql
security definer
set search_path = extensions, vault, public
as $$
declare
  nuevo_id uuid;
begin
  insert into reportes (
    rol, persona_hash, telefono_hash, direccion_hash,
    zona, motivo, descripcion, evidencia_paths, reportante_hash
  )
  values (
    p_rol,
    case when p_persona is not null then _hmac(p_persona) else null end,
    case when p_telefono is not null then _hmac(regexp_replace(p_telefono, '\D', '', 'g')) else null end,
    case when p_direccion is not null then _hmac(p_direccion) else null end,
    p_zona, p_motivo, p_descripcion, p_evidencia_paths, _hmac(p_reportante_id)
  )
  returning id into nuevo_id;

  return nuevo_id;
end;
$$;

-- Corroborar un reporte existente (reportante independiente)
create or replace function corroborar_reporte(
  p_reporte_id uuid,
  p_reportante_id text,
  p_comentario text default null
)
returns void
language plpgsql
security definer
set search_path = extensions, vault, public
as $$
begin
  insert into corroboraciones (reporte_id, reportante_hash, comentario)
  values (p_reporte_id, _hmac(p_reportante_id), p_comentario)
  on conflict (reporte_id, reportante_hash) do nothing;

  update reportes
  set corroboraciones = (select count(*) from corroboraciones where reporte_id = p_reporte_id),
      estado = case
        when (select count(*) from corroboraciones where reporte_id = p_reporte_id) >= 2
          then 'verificado'::estado_reporte
        else estado
      end
  where id = p_reporte_id;
end;
$$;

-- Presentar descargo (el acusado responde)
create or replace function presentar_descargo(
  p_reporte_id uuid,
  p_texto text,
  p_evidencia_paths text[] default null
)
returns uuid
language plpgsql
security definer
set search_path = extensions, vault, public
as $$
declare
  nuevo_id uuid;
begin
  insert into descargos (reporte_id, texto, evidencia_paths)
  values (p_reporte_id, p_texto, p_evidencia_paths)
  returning id into nuevo_id;

  update reportes set estado = 'en_disputa' where id = p_reporte_id and estado = 'pendiente';

  return nuevo_id;
end;
$$;

-- ------------------------------------------------------------
-- STORAGE: bucket privado para evidencias
-- ------------------------------------------------------------
-- Crear manualmente en el dashboard o vía API:
-- bucket "evidencias-maath", privado, acceso solo vía signed URLs

-- ------------------------------------------------------------
-- SECRETO VAULT (ejecutar una sola vez, reemplazar valor real)
-- ------------------------------------------------------------
-- select vault.create_secret('un-secreto-largo-random-unico', 'maath_hmac_key');

-- ============================================================
-- ESTADO DE DEPLOYMENT
-- ============================================================
-- Project ID: kjvuhgmkpiewtuqzyjjl
-- Region: sa-east-1
-- Org: leph-maat's (firrumkxyillwmusidbi)
-- Secreto Vault "maath_hmac_key": generado y aplicado (2026-08-11)
-- Migración "init_maath_schema": aplicada OK

-- ============================================================
-- ACTUALIZACIONES POSTERIORES (aplicadas directo en Supabase,
-- documentadas acá para que el Zep quede completo)
-- ============================================================

-- 1) RLS activado en las 3 tablas + policies de lectura pública
-- 2) Storage: bucket "evidencias-maath" privado + policies authenticated
-- 3) Auth: crear_reporte/corroborar_reporte/presentar_descargo migradas
--    a usar auth.uid() en vez de un string libre para el reportante
-- 4) Tabla "perfiles" + funciones _acceso_habilitado(), mi_estado_cuenta(),
--    marcar_pago() para el modelo de trial de 7 dias + pago manual
--
-- Ver README.md para el detalle de cada función y su estado actual.
