-- ============================================================
-- Electro Rayo — Supabase Database Setup
-- Ejecutar en: Supabase > SQL Editor > New Query
-- ============================================================

-- ─── COMMENTS ──────────────────────────────────────────────────
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  user_name   text not null,
  text        text not null check (char_length(text) between 1 and 1000),
  created_at  timestamptz default now()
);

alter table comments enable row level security;

create policy "comments_read_public"
  on comments for select using (true);

create policy "comments_insert_own"
  on comments for insert with check (auth.uid() = user_id);

create policy "comments_delete_own"
  on comments for delete using (auth.uid() = user_id);


-- ─── PRESUPUESTOS ──────────────────────────────────────────────
create table if not exists presupuestos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  telefono    text not null,
  email       text,
  zona        text,
  servicio    text not null,
  inmueble    text,
  descripcion text,
  estado      text default 'pendiente' check (estado in ('pendiente','visto','en_proceso','completado')),
  created_at  timestamptz default now()
);

alter table presupuestos enable row level security;

create policy "presupuestos_insert_public"
  on presupuestos for insert with check (true);

-- El backend usa service_role key que bypasea RLS para leer


-- ─── INDEXES ────────────────────────────────────────────────────
create index if not exists comments_created_at_idx on comments(created_at desc);
create index if not exists presupuestos_estado_idx  on presupuestos(estado);
create index if not exists presupuestos_created_idx on presupuestos(created_at desc);
