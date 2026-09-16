-- Bonus Hunt Tracker: wspólna baza huntów dla ekipy.
-- Wklej to w Supabase → SQL Editor → Run. Można odpalać wielokrotnie.
--
-- Model: jeden wiersz = jeden hunt, cały jego JSON leży w kolumnie `data`.
-- Dzięki temu kształt hunta może się zmieniać bez migracji schematu.

create table if not exists public.hunts (
  id text primary key,
  data jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists hunts_updated_at_idx on public.hunts (updated_at desc);

-- Każdy upsert odświeża znacznik czasu, na nim opiera się rozstrzyganie konfliktów.
create or replace function public.hunts_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hunts_touch_updated_at on public.hunts;
create trigger hunts_touch_updated_at
  before insert or update on public.hunts
  for each row execute function public.hunts_touch_updated_at();

-- Same polityki RLS nie wystarczą: rola `anon` potrzebuje jeszcze uprawnień
-- na tabeli, inaczej REST oddaje 401 "permission denied for table hunts".
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.hunts to anon, authenticated;

-- RLS: apka nie ma logowania, więc anon może wszystko na tej jednej tabeli.
-- Kto zna adres apki, ten może czytać i pisać hunty. Świadoma decyzja.
alter table public.hunts enable row level security;

drop policy if exists "anon czyta hunty" on public.hunts;
create policy "anon czyta hunty" on public.hunts
  for select to anon, authenticated using (true);

drop policy if exists "anon zapisuje hunty" on public.hunts;
create policy "anon zapisuje hunty" on public.hunts
  for insert to anon, authenticated with check (true);

drop policy if exists "anon aktualizuje hunty" on public.hunts;
create policy "anon aktualizuje hunty" on public.hunts
  for update to anon, authenticated using (true) with check (true);

-- Realtime: żeby telefon widział na żywo to, co wpisuje komputer.
-- Kasowanie hunta to update z deleted = true, więc DELETE nie jest potrzebny.
do $$
begin
  alter publication supabase_realtime add table public.hunts;
exception
  when duplicate_object then null;
end;
$$;
