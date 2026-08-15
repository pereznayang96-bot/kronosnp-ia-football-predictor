-- ════════════════════════════════════════════════════════════════════════════════
-- KRONOSNP IA — Script SQL complet pour Supabase
-- À coller dans Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════════════════════
-- Couvre :
--   • Profils utilisateurs (user_profiles)
--   • Rôles premium + expiration (user_roles)
--   • Historique des prédictions (predictions)
--   • Abonnements & paywall (subscriptions, payment_events)
--   • Défi gamifié hebdomadaire (challenges, challenge_entries)
--   • Matchs & logs IA (matches, ai_performance_logs, admin_alerts)
--   • Auth Supabase : tables auth.* + triggers pour synchro profil
--   • Row Level Security (RLS) — chaque user ne voit que ses données
--   • Vues utiles (v_active_premium_users, v_user_predictions_with_match)
-- ════════════════════════════════════════════════════════════════════════════════

-- 1) PROFILS UTILISATEURS
create table if not exists public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  display_name    text,
  avatar_url      text,
  phone           text,
  country         text,
  preferred_currency text default 'USD',
  marketing_consent boolean default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_user_profiles_email on public.user_profiles(email);

-- 2) RÔLES PREMIUM
create table if not exists public.user_roles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  role              text not null default 'user_free'
                       check (role in ('user_free','premium_basic','premium_pro','club_pro','admin')),
  premium_expires_at timestamptz,
  premium_plan      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id)
);
create index if not exists idx_user_roles_user on public.user_roles(user_id);

-- 3) MATCHS
create table if not exists public.matches (
  id                   text primary key,
  home_team            text not null,
  away_team            text not null,
  league               text not null,
  league_country       text default '',
  kickoff_time         timestamptz not null,
  status               text not null default 'scheduled'
                          check (status in ('scheduled','live','finished','postponed','cancelled')),
  home_score           integer,
  away_score           integer,
  ai_home_score_pred   integer,
  ai_away_score_pred   integer,
  ai_1n2_pred          text check (ai_1n2_pred in ('1','N','2')),
  confidence_score     real default 0.5,
  odds_home            real,
  odds_draw            real,
  odds_away            real,
  value_bet            text,
  media_sources        jsonb default '[]'::jsonb,
  live_minute          integer default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists idx_matches_kickoff on public.matches(kickoff_time);
create index if not exists idx_matches_status   on public.matches(status);

-- 4) HISTORIQUE DES PRÉDICTIONS
create table if not exists public.predictions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  match_id      text not null references public.matches(id) on delete cascade,
  pred_home_score integer,
  pred_away_score integer,
  pred_1n2      text check (pred_1n2 in ('1','N','2')),
  is_correct    boolean default false,
  created_at    timestamptz not null default now(),
  unique (user_id, match_id)
);
create index if not exists idx_predictions_user  on public.predictions(user_id);
create index if not exists idx_predictions_match on public.predictions(match_id);

-- 5) ABONNEMENTS (PAYANT / PAYWALL)
create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  plan               text not null
                        check (plan in ('user_free','premium_basic','premium_pro','club_pro')),
  currency           text not null default 'USD',
  amount             numeric(10,2) not null,
  status             text not null default 'active'
                        check (status in ('active','expired','cancelled','pending')),
  stripe_session_id  text,
  stripe_customer_id text,
  payment_method     text default 'stripe'
                        check (payment_method in ('stripe','orange_money','mtn_momo','wave','paypal')),
  starts_at          timestamptz not null default now(),
  expires_at         timestamptz not null,
  created_at         timestamptz not null default now()
);
create index if not exists idx_subs_user on public.subscriptions(user_id);
create index if not exists idx_subs_status on public.subscriptions(status);

-- 6) EVÈNEMENTS DE PAIEMENT (audit / logs)
create table if not exists public.payment_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event_type  text not null,           -- 'checkout.session.completed', 'invoice.paid', etc.
  provider    text not null default 'stripe',
  amount      numeric(10,2),
  currency    text,
  payload     jsonb,
  received_at timestamptz not null default now()
);
create index if not exists idx_payment_events_user on public.payment_events(user_id);

-- 7) DÉFI HEBDOMADAIRE
create table if not exists public.challenges (
  id          uuid primary key default gen_random_uuid(),
  week_start  date not null,
  week_end    date not null,
  match_ids   jsonb not null default '[]'::jsonb,
  status      text not null default 'active'
                  check (status in ('active','closed','archived')),
  created_at  timestamptz not null default now()
);

create table if not exists public.challenge_entries (
  id                 uuid primary key default gen_random_uuid(),
  challenge_id       uuid not null references public.challenges(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  predictions        jsonb not null default '[]'::jsonb,
  score              integer default 0,
  prize_time_hours   integer default 0,
  created_at         timestamptz not null default now(),
  unique (challenge_id, user_id)
);

-- 8) LOGS DE PERFORMANCE IA (admin)
create table if not exists public.ai_performance_logs (
  id                   uuid primary key default gen_random_uuid(),
  match_id             text not null references public.matches(id) on delete cascade,
  actual_home_score    integer,
  actual_away_score    integer,
  predicted_home_score integer,
  predicted_away_score integer,
  predicted_1n2        text,
  actual_1n2           text,
  score_correct        boolean default false,
  outcome_correct      boolean default false,
  confidence_score     real,
  league               text,
  created_at           timestamptz not null default now()
);

-- 9) ALERTES ADMIN
create table if not exists public.admin_alerts (
  id           uuid primary key default gen_random_uuid(),
  alert_type   text not null,
  severity     text not null default 'info'
                  check (severity in ('info','warning','error','critical')),
  message      text not null,
  metadata     jsonb default '{}'::jsonb,
  acknowledged boolean default false,
  created_at   timestamptz not null default now()
);

-- 10) SECTIONS DU GUIDE PARIEUR
create table if not exists public.parieur_guide_sections (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null,
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — chaque user ne voit / modifie que SES données
-- ════════════════════════════════════════════════════════════════════════════════

alter table public.user_profiles         enable row level security;
alter table public.user_roles            enable row level security;
alter table public.predictions           enable row level security;
alter table public.subscriptions         enable row level security;
alter table public.payment_events        enable row level security;
alter table public.challenge_entries     enable row level security;

-- Matches, challenges, AI logs, alertes : lecture publique (matches.predictor)
alter table public.matches                  enable row level security;
alter table public.challenges               enable row level security;
alter table public.ai_performance_logs      enable row level security;
alter table public.admin_alerts             enable row level security;
alter table public.parieur_guide_sections   enable row level security;

-- Helper : rôle actuel de l'utilisateur (sécurité definer — ne contourne pas la sienne)
create or replace function public.current_user_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

-- Helper : user premium actif ?
create or replace function public.is_current_user_premium()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('premium_basic','premium_pro','club_pro')
      and (premium_expires_at is null or premium_expires_at > now())
  );
$$;

-- Profils : user = lui-même
drop policy if exists "profiles_select_self" on public.user_profiles;
create policy "profiles_select_self" on public.user_profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_insert_self" on public.user_profiles;
create policy "profiles_insert_self" on public.user_profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_self" on public.user_profiles;
create policy "profiles_update_self" on public.user_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Rôles : user = lui-même (lecture), insert/update réservé service_role (webhooks admin)
drop policy if exists "roles_select_self" on public.user_roles;
create policy "roles_select_self" on public.user_roles
  for select using (auth.uid() = user_id);

-- Prédictions : CRUD user = soi-même
drop policy if exists "pred_select_self" on public.predictions;
create policy "pred_select_self" on public.predictions
  for select using (auth.uid() = user_id);
drop policy if exists "pred_insert_self" on public.predictions;
create policy "pred_insert_self" on public.predictions
  for insert with check (auth.uid() = user_id);
drop policy if exists "pred_update_self" on public.predictions;
create policy "pred_update_self" on public.predictions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "pred_delete_self" on public.predictions;
create policy "pred_delete_self" on public.predictions
  for delete using (auth.uid() = user_id);

-- Abonnements : user lit les siens
drop policy if exists "subs_select_self" on public.subscriptions;
create policy "subs_select_self" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Events paiement : user lit les siens (les inserts passent par service_role / webhooks Stripe)
drop policy if exists "pe_select_self" on public.payment_events;
create policy "pe_select_self" on public.payment_events
  for select using (auth.uid() = user_id);

-- Challenge entries : user lit/écrit les siennes
drop policy if exists "ce_select_self" on public.challenge_entries;
create policy "ce_select_self" on public.challenge_entries
  for select using (auth.uid() = user_id);
drop policy if exists "ce_insert_self" on public.challenge_entries;
create policy "ce_insert_self" on public.challenge_entries
  for insert with check (auth.uid() = user_id);
drop policy if exists "ce_update_self" on public.challenge_entries;
create policy "ce_update_self" on public.challenge_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Matches, challenges, guide : lecture publique pour utilisateurs connectés ET anon
drop policy if exists "matches_read_all" on public.matches;
create policy "matches_read_all" on public.matches for select using (true);

drop policy if exists "challenges_read_all" on public.challenges;
create policy "challenges_read_all" on public.challenges for select using (true);

drop policy if exists "guide_read_active" on public.parieur_guide_sections;
create policy "guide_read_active" on public.parieur_guide_sections
  for select using (is_active = true);

-- ════════════════════════════════════════════════════════════════════════════════
-- TRIGGERS — synchro auto entre auth.users et public.user_profiles / user_roles
-- ════════════════════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', null),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user_free')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automatique
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated on public.user_profiles;
create trigger trg_user_profiles_updated before update on public.user_profiles
  for each row execute function public.tg_set_updated_at();

drop trigger if exists trg_user_roles_updated on public.user_roles;
create trigger trg_user_roles_updated before update on public.user_roles
  for each row execute function public.tg_set_updated_at();

drop trigger if exists trg_matches_updated on public.matches;
create trigger trg_matches_updated before update on public.matches
  for each row execute function public.tg_set_updated_at();

-- ════════════════════════════════════════════════════════════════════════════════
-- VUES UTILES (dashboards + admin)
-- ════════════════════════════════════════════════════════════════════════════════

-- Premium actifs
create or replace view public.v_active_premium_users as
select u.id, u.email, ur.role, ur.premium_expires_at
from auth.users u
join public.user_roles ur on ur.user_id = u.id
where ur.role in ('premium_basic','premium_pro','club_pro')
  and (ur.premium_expires_at is null or ur.premium_expires_at > now());

-- Prédictions enrichies (user + match)
create or replace view public.v_user_predictions_with_match as
select p.*, m.home_team, m.away_team, m.kickoff_time, m.status as match_status
from public.predictions p
join public.matches m on m.id = p.match_id;

-- ════════════════════════════════════════════════════════════════════════════════
-- SEED OPTIONNEL — quelques matchs d'exemple (à commenter si non désiré)
-- ════════════════════════════════════════════════════════════════════════════════

insert into public.matches (id, home_team, away_team, league, kickoff_time, ai_1n2_pred, confidence_score)
values
  ('seed_001', 'Manchester City', 'Arsenal',       'Premier League', now() + interval '2 day', '1', 0.82),
  ('seed_002', 'Real Madrid',     'Barcelona',     'La Liga',       now() + interval '3 day', '1', 0.74),
  ('seed_003', 'Bayern Munich',   'Dortmund',      'Bundesliga',    now() + interval '4 day', '1', 0.69),
  ('seed_004', 'PSG',             'Marseille',     'Ligue 1',       now() + interval '5 day', '1', 0.71),
  ('seed_005', 'Inter Miami',     'LAFC',          'MLS',           now() + interval '6 day', 'N', 0.58)
on conflict (id) do nothing;

insert into public.parieur_guide_sections (title, content, sort_order, is_active) values
  ('Bienvenue dans le guide', 'Section d''introduction au pari sportif intelligent avec KronosNP IA.', 1, true),
  ('Lire les cotes',          'Comment interpréter une cote et calculer la valeur (value bet).',          2, true),
  ('Gestion de bankroll',     'Méthode Kelly fractionnée pour protéger ton capital.',                     3, true)
on conflict do nothing;

-- FIN DU SCRIPT — KronosNP IA Supabase schema ✅
