-- Daily briefings
create table if not exists public.briefings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  briefing_date date not null,
  content jsonb not null default '{}',
  delivered_via text[] default '{}',
  delivered_at timestamptz,
  created_at timestamptz default now()
);

create index idx_briefings_tenant on public.briefings(tenant_id);
create index idx_briefings_date on public.briefings(tenant_id, briefing_date);

alter table public.briefings enable row level security;

create policy "Tenant isolation for briefings"
  on public.briefings for all
  using (tenant_id = public.get_user_tenant_id())
  with check (tenant_id = public.get_user_tenant_id());

-- Add briefing config to business_config
alter table public.business_config
  add column if not exists briefing_enabled boolean default false,
  add column if not exists briefing_time time default '07:00',
  add column if not exists briefing_channels text[] default '{email}',
  add column if not exists nylas_grant_id text,
  add column if not exists nylas_calendar_id text;
