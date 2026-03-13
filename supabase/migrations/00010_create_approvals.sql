create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  action_type text not null,
  action_details jsonb not null default '{}',
  context_summary text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied', 'expired')),
  decided_by uuid,
  decided_at timestamptz,
  decided_via text check (decided_via in ('dashboard', 'sms', null)),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  sms_sent boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_approvals_tenant on public.approvals(tenant_id);
create index idx_approvals_status on public.approvals(tenant_id, status);
create index idx_approvals_expires on public.approvals(expires_at) where status = 'pending';

-- Enable realtime for approvals
alter publication supabase_realtime add table public.approvals;

-- RLS
alter table public.approvals enable row level security;

create policy "Users can view approvals in their tenant"
  on public.approvals for select
  using (tenant_id = public.get_user_tenant_id());

create policy "Users can insert approvals in their tenant"
  on public.approvals for insert
  with check (tenant_id = public.get_user_tenant_id());

create policy "Users can update approvals in their tenant"
  on public.approvals for update
  using (tenant_id = public.get_user_tenant_id());
