-- Appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  staff_id uuid references public.user_profiles(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'pending', 'cancelled', 'completed', 'no_show')),
  notes text,
  nylas_event_id text,
  source text not null default 'ai' check (source in ('ai', 'manual', 'online', 'calendar_sync')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_appointments_tenant on public.appointments(tenant_id);
create index idx_appointments_starts on public.appointments(tenant_id, starts_at);
create index idx_appointments_client on public.appointments(client_id);
create index idx_appointments_status on public.appointments(tenant_id, status);

alter table public.appointments enable row level security;

create policy "Tenant isolation for appointments"
  on public.appointments for all
  using (tenant_id = public.get_user_tenant_id())
  with check (tenant_id = public.get_user_tenant_id());

alter publication supabase_realtime add table public.appointments;
