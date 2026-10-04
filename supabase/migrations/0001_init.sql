-- Crie seu Influenciador Sintético — migration inicial.
-- Rode isso no SQL Editor do seu projeto Supabase (Dashboard → SQL Editor → New query).
-- Uma tabela só, com RLS garantindo que cada pessoa só lê/escreve os
-- próprios personagens.

create table if not exists public.characters (
  id          text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists characters_user_id_updated_at_idx
  on public.characters (user_id, updated_at desc);

alter table public.characters enable row level security;

-- Row-Level Security: cada usuário só vê e muda os próprios personagens.
drop policy if exists "own characters: select" on public.characters;
create policy "own characters: select"
  on public.characters for select
  using (auth.uid() = user_id);

drop policy if exists "own characters: insert" on public.characters;
create policy "own characters: insert"
  on public.characters for insert
  with check (auth.uid() = user_id);

drop policy if exists "own characters: update" on public.characters;
create policy "own characters: update"
  on public.characters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own characters: delete" on public.characters;
create policy "own characters: delete"
  on public.characters for delete
  using (auth.uid() = user_id);

-- Trigger simples pra manter updated_at sincronizado em updates
-- (opcional — a app já envia updated_at, mas o DB garante um fallback).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists characters_touch_updated_at on public.characters;
create trigger characters_touch_updated_at
  before update on public.characters
  for each row execute function public.touch_updated_at();
