create extension if not exists pgcrypto;

create table public.traits (
  id text primary key,
  label text not null,
  description text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  text text not null check (length(trim(text)) > 0),
  trait_id text not null references public.traits(id) on delete restrict,
  sort_order int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index questions_trait_idx on public.questions(trait_id) where deleted_at is null;

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  scores  jsonb not null check (jsonb_typeof(scores)  = 'object')
);

create index submissions_submitted_at_idx on public.submissions(submitted_at desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_questions_updated
  before update on public.questions
  for each row execute function public.touch_updated_at();

create trigger trg_traits_updated
  before update on public.traits
  for each row execute function public.touch_updated_at();

alter table public.traits      enable row level security;
alter table public.questions   enable row level security;
alter table public.submissions enable row level security;

create policy traits_read     on public.traits      for select using (true);
create policy questions_read  on public.questions   for select using (deleted_at is null);
create policy submissions_insert on public.submissions for insert with check (true);

create policy traits_admin       on public.traits      for all to authenticated using (true) with check (true);
create policy questions_admin    on public.questions   for all to authenticated using (true) with check (true);
create policy submissions_admin  on public.submissions for all to authenticated using (true) with check (true);
