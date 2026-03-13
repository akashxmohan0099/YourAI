-- Availability rules (recurring weekly slots)
create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid references public.user_profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  created_at timestamptz default now(),
  constraint valid_time_range check (start_time < end_time)
);

create index idx_availability_rules_tenant on public.availability_rules(tenant_id);
create index idx_availability_rules_staff on public.availability_rules(tenant_id, staff_id);

alter table public.availability_rules enable row level security;

create policy "Tenant isolation for availability_rules"
  on public.availability_rules for all
  using (tenant_id = public.get_user_tenant_id())
  with check (tenant_id = public.get_user_tenant_id());

-- Availability overrides (specific date exceptions: holidays, sick days)
create table if not exists public.availability_overrides (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  staff_id uuid references public.user_profiles(id) on delete cascade,
  override_date date not null,
  start_time time,
  end_time time,
  is_available boolean not null default false,
  reason text,
  created_at timestamptz default now()
);

create index idx_availability_overrides_tenant on public.availability_overrides(tenant_id);
create index idx_availability_overrides_date on public.availability_overrides(tenant_id, override_date);

alter table public.availability_overrides enable row level security;

create policy "Tenant isolation for availability_overrides"
  on public.availability_overrides for all
  using (tenant_id = public.get_user_tenant_id())
  with check (tenant_id = public.get_user_tenant_id());
