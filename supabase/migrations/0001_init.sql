-- ===========================================================================
-- Afro-Latina Party — initial schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
-- Everything is locked down with RLS: only the service_role key (used
-- server-side by the Next.js API) can read/write. The browser never touches
-- these tables directly.
-- ===========================================================================

-- gen_random_uuid()
create extension if not exists pgcrypto;

-- --- Enums -----------------------------------------------------------------
do $$ begin
  create type registration_category as enum
    ('VAS_MEMBER', 'STUDENT', 'NON_STUDENT', 'CONTRIBUTOR');
exception when duplicate_object then null; end $$;

do $$ begin
  create type registration_status as enum
    ('PENDING', 'MEMBER_PENDING', 'MEMBER_APPROVED', 'MEMBER_REJECTED',
     'CONTRIBUTOR_PENDING', 'CONTRIBUTOR_APPROVED', 'CONTRIBUTOR_REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('NOT_REQUESTED', 'WAITING_PAYMENT', 'PAID');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('NOT_GENERATED', 'GENERATED', 'USED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_language as enum ('fr', 'en', 'de');
exception when duplicate_object then null; end $$;

-- --- Human-friendly registration codes: REG-YYYY-000001 --------------------
create sequence if not exists registration_code_seq;

-- --- Registrations ---------------------------------------------------------
create table if not exists registrations (
  id                uuid primary key default gen_random_uuid(),
  registration_code text unique not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  first_name        text not null,
  last_name         text not null,
  email             text not null,
  phone             text not null,
  language          app_language not null default 'fr',

  category          registration_category not null,
  member_number     text,
  pay_now           boolean not null default false,

  status            registration_status not null,
  payment_status    payment_status not null default 'NOT_REQUESTED',
  ticket_status     ticket_status not null default 'NOT_GENERATED',

  -- Ticket fields (populated in later steps). UNIQUE guarantees one ticket
  -- per person even under concurrent requests.
  ticket_id         text unique,
  ticket_token      text unique,
  ticket_sent_at    timestamptz,

  checked_in        boolean not null default false,
  checked_in_at     timestamptz,

  admin_notes       text
);

create index if not exists idx_registrations_status         on registrations (status);
create index if not exists idx_registrations_payment_status on registrations (payment_status);
create index if not exists idx_registrations_category       on registrations (category);
create index if not exists idx_registrations_email          on registrations (lower(email));
create index if not exists idx_registrations_created_at     on registrations (created_at desc);

-- --- Triggers --------------------------------------------------------------
-- Assign the registration code + stamp updated_at on insert.
create or replace function set_registration_defaults() returns trigger as $$
begin
  if new.registration_code is null or new.registration_code = '' then
    new.registration_code :=
      'REG-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('registration_code_seq')::text, 6, '0');
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_registration_defaults on registrations;
create trigger trg_registration_defaults
  before insert on registrations
  for each row execute function set_registration_defaults();

-- Keep updated_at fresh on every update.
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_updated_at on registrations;
create trigger trg_touch_updated_at
  before update on registrations
  for each row execute function touch_updated_at();

-- --- Check-in history (scanner, used from Étape 5) -------------------------
create table if not exists check_ins (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid references registrations (id) on delete cascade,
  scanned_at      timestamptz not null default now(),
  -- VALID | ALREADY_USED | INVALID | NOT_FOUND
  result          text not null
);

create index if not exists idx_check_ins_registration on check_ins (registration_id);
create index if not exists idx_check_ins_scanned_at    on check_ins (scanned_at desc);

-- --- Row Level Security ----------------------------------------------------
-- Enable RLS and create NO policies => anon/authenticated roles have zero
-- access. The service_role key bypasses RLS, so only the Next.js server
-- (which holds that key) can operate on these tables.
alter table registrations enable row level security;
alter table check_ins     enable row level security;

revoke all on registrations from anon, authenticated;
revoke all on check_ins     from anon, authenticated;
