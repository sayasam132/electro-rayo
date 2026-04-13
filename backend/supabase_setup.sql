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


-- ─── REVIEWS ────────────────────────────────────────────────────
create table if not exists reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  user_name  text not null,
  rating     int not null check (rating between 1 and 5),
  text       text not null check (char_length(text) between 1 and 500),
  created_at timestamptz default now()
);

alter table reviews enable row level security;

create policy "reviews_read_public"  on reviews for select using (true);
create policy "reviews_insert_own"   on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_delete_own"   on reviews for delete using (auth.uid() = user_id);

create index if not exists reviews_created_idx on reviews(created_at desc);


-- ─── STORAGE: fotos-servicios ───────────────────────────────────
-- Ejecutar en: Supabase > SQL Editor
insert into storage.buckets (id, name, public)
values ('fotos-servicios', 'fotos-servicios', true)
on conflict (id) do nothing;

-- Cualquiera puede ver las fotos (bucket público)
create policy "fotos_read_public"
  on storage.objects for select
  using ( bucket_id = 'fotos-servicios' );

-- Solo el admin autenticado puede subir fotos
create policy "fotos_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'fotos-servicios'
    and auth.email() = 'sayasammejia2@gmail.com'
  );

-- Solo el admin puede borrar fotos
create policy "fotos_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'fotos-servicios'
    and auth.email() = 'sayasammejia2@gmail.com'
  );
