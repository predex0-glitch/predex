create table if not exists public.chamados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  apartamento text not null,
  mensagem text not null,
  status text not null default 'aberto' check (status in ('aberto', 'em_andamento', 'resolvido')),
  criado_em timestamptz not null default now()
);
