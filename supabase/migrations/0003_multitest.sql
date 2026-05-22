-- Extends single-test (Big Five) schema to a multi-test platform.
-- Safe to apply on a fresh DB or one with existing Big Five data.

-- ============================================================
-- 1. tests table
-- ============================================================
create table public.tests (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name             text not null,
  tagline          text not null default '',
  description      text not null default '',
  question_kind    text not null check (question_kind in ('likert', 'forced_choice', 'mixed')),
  scoring_strategy text not null check (scoring_strategy in
    ('likert_percentage', 'mbti_dichotomy', 'enneagram_dominant', 'cognitive_stack')),
  result_template  text not null check (result_template in
    ('bars', 'mbti_code', 'enneagram_type', 'cognitive_stack')),
  is_published     boolean not null default false,
  sort_order       int not null default 0,
  estimated_minutes int not null default 5,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger trg_tests_updated
  before update on public.tests
  for each row execute function public.touch_updated_at();

alter table public.tests enable row level security;
create policy tests_read  on public.tests for select using (is_published = true);
create policy tests_admin on public.tests for all to authenticated using (true) with check (true);

-- ============================================================
-- 2. Extend existing tables (nullable first, NOT NULL after backfill)
-- ============================================================

alter table public.traits
  add column test_id  uuid references public.tests(id) on delete cascade,
  add column slug     text,
  add column polarity text;

alter table public.questions
  add column test_id       uuid references public.tests(id) on delete cascade,
  add column kind          text not null default 'likert'
                             check (kind in ('likert', 'forced_choice')),
  add column reverse_keyed boolean not null default false;
alter table public.questions alter column trait_id drop not null;

alter table public.submissions
  add column test_id       uuid references public.tests(id) on delete restrict,
  add column archetype_code text;

-- ============================================================
-- 3. question_options (trait_id uuid; FK constraint added after PK switch)
-- ============================================================
create table public.question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label       text not null check (length(trim(label)) > 0),
  value       int  not null,
  trait_id    uuid,
  weight      numeric not null default 1.0,
  sort_order  int not null default 0
);

create index question_options_question_idx on public.question_options(question_id);

alter table public.question_options enable row level security;
create policy options_read  on public.question_options for select using (true);
create policy options_admin on public.question_options for all to authenticated using (true) with check (true);

-- ============================================================
-- 4. archetypes
-- ============================================================
create table public.archetypes (
  id          uuid primary key default gen_random_uuid(),
  test_id     uuid not null references public.tests(id) on delete cascade,
  code        text not null,
  label       text not null,
  description text not null default '',
  long_form   text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (test_id, code)
);

create trigger trg_archetypes_updated
  before update on public.archetypes
  for each row execute function public.touch_updated_at();

alter table public.archetypes enable row level security;
create policy archetypes_read  on public.archetypes for select using (true);
create policy archetypes_admin on public.archetypes for all to authenticated using (true) with check (true);

-- ============================================================
-- 5. Insert Big Five test row and backfill existing data
-- ============================================================
insert into public.tests (
  slug, name, tagline, description,
  question_kind, scoring_strategy, result_template,
  is_published, sort_order, estimated_minutes
) values (
  'big-five', 'Big Five',
  'Discover your OCEAN personality profile',
  'A widely-validated personality model measuring five core traits: openness, conscientiousness, extraversion, agreeableness, and emotional stability.',
  'likert', 'likert_percentage', 'bars',
  true, 1, 5
);

update public.traits
  set slug    = id,
      test_id = (select id from public.tests where slug = 'big-five');

update public.questions
  set test_id = (select id from public.tests where slug = 'big-five');

update public.submissions
  set test_id = (select id from public.tests where slug = 'big-five');

-- ============================================================
-- 6. Switch traits PK from text to uuid
-- ============================================================

drop index public.questions_trait_idx;
alter table public.questions drop constraint questions_trait_id_fkey;

alter table public.traits add column new_id uuid not null default gen_random_uuid();

alter table public.questions add column trait_uuid uuid;
update public.questions q
  set trait_uuid = t.new_id
  from public.traits t
  where t.id = q.trait_id;

alter table public.traits drop constraint traits_pkey;
alter table public.traits add primary key (new_id);
alter table public.traits drop column id;
alter table public.traits rename column new_id to id;

alter table public.traits alter column slug    set not null;
alter table public.traits alter column test_id set not null;
alter table public.traits add constraint traits_test_slug_unique unique (test_id, slug);

alter table public.questions drop column trait_id;
alter table public.questions rename column trait_uuid to trait_id;
alter table public.questions add constraint questions_trait_id_fkey
  foreign key (trait_id) references public.traits(id) on delete restrict;

alter table public.question_options add constraint question_options_trait_id_fkey
  foreign key (trait_id) references public.traits(id) on delete cascade;

-- ============================================================
-- 7. Enforce NOT NULL and rebuild indexes
-- ============================================================
alter table public.questions  alter column test_id set not null;
alter table public.submissions alter column test_id set not null;

create index questions_test_idx  on public.questions(test_id)  where deleted_at is null;
create index questions_trait_idx on public.questions(trait_id) where deleted_at is null;
create index submissions_test_id_idx on public.submissions(test_id, submitted_at desc);
