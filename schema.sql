-- BONOPAY - Esquema base de datos Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de trabajadores
create table if not exists workers (
  id integer primary key,
  n text not null,
  rut text,
  cargo text,
  p text check (p in ('PMC','UCO','NAT')),
  t text check (t in ('SIND','NOSIND')),
  created_at timestamptz default now()
);

-- Tabla de datos del mes
create table if not exists mes_data (
  id uuid default gen_random_uuid() primary key,
  mes text unique not null,
  mes_data text default '{}',
  viajes text default '[]',
  user_id uuid references auth.users,
  updated_at timestamptz default now()
);

-- Tabla de historial de bonificaciones
create table if not exists historial (
  id uuid default gen_random_uuid() primary key,
  mes text unique not null,
  total_pmc bigint default 0,
  total_uco bigint default 0,
  total_nat bigint default 0,
  total_general bigint default 0,
  bonos text default '{}',
  user_id uuid references auth.users,
  created_at timestamptz default now()
);

-- Tabla de valores base
create table if not exists valores_base (
  id integer primary key default 1,
  valores text default '{}',
  updated_at timestamptz default now()
);

-- Políticas de seguridad (RLS)
alter table workers enable row level security;
alter table mes_data enable row level security;
alter table historial enable row level security;
alter table valores_base enable row level security;

-- Solo usuarios autenticados pueden leer y escribir
create policy "Autenticados pueden leer workers" on workers for select to authenticated using (true);
create policy "Autenticados pueden insertar workers" on workers for insert to authenticated with check (true);
create policy "Autenticados pueden actualizar workers" on workers for update to authenticated using (true);
create policy "Autenticados pueden eliminar workers" on workers for delete to authenticated using (true);

create policy "Autenticados pueden leer mes_data" on mes_data for select to authenticated using (true);
create policy "Autenticados pueden insertar mes_data" on mes_data for insert to authenticated with check (true);
create policy "Autenticados pueden actualizar mes_data" on mes_data for update to authenticated using (true);

create policy "Autenticados pueden leer historial" on historial for select to authenticated using (true);
create policy "Autenticados pueden insertar historial" on historial for insert to authenticated with check (true);
create policy "Autenticados pueden actualizar historial" on historial for update to authenticated using (true);

create policy "Autenticados pueden leer valores" on valores_base for select to authenticated using (true);
create policy "Autenticados pueden insertar valores" on valores_base for insert to authenticated with check (true);
create policy "Autenticados pueden actualizar valores" on valores_base for update to authenticated using (true);
