create extension if not exists pgcrypto;

create table if not exists public.condominios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo text not null unique check (char_length(codigo) = 6),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists condominios_user_id_idx on public.condominios (user_id);
