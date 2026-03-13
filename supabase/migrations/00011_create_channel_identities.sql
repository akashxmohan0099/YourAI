create table public.channel_identities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  channel text not null check (channel in ('web_chat', 'voice', 'sms', 'whatsapp', 'email')),
  identifier text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, channel, identifier)
);

create index idx_channel_identities_client on public.channel_identities(client_id);
create index idx_channel_identities_lookup on public.channel_identities(tenant_id, channel, identifier);

-- RLS
alter table public.channel_identities enable row level security;

create policy "Users can view channel identities in their tenant"
  on public.channel_identities for select
  using (tenant_id = public.get_user_tenant_id());

create policy "Users can insert channel identities in their tenant"
  on public.channel_identities for insert
  with check (tenant_id = public.get_user_tenant_id());

create policy "Users can update channel identities in their tenant"
  on public.channel_identities for update
  using (tenant_id = public.get_user_tenant_id());
