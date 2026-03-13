-- Client notes
create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id),
  source text not null default 'manual' check (source in ('ai', 'manual')),
  created_at timestamptz default now()
);

create index idx_client_notes_client on public.client_notes(client_id);
create index idx_client_notes_tenant on public.client_notes(tenant_id);

alter table public.client_notes enable row level security;

create policy "Tenant isolation for client_notes"
  on public.client_notes for all
  using (tenant_id = public.get_user_tenant_id())
  with check (tenant_id = public.get_user_tenant_id());

-- Client tags
create table if not exists public.client_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  tag text not null,
  created_at timestamptz default now(),
  constraint unique_client_tag unique (client_id, tag)
);

create index idx_client_tags_client on public.client_tags(client_id);
create index idx_client_tags_tenant on public.client_tags(tenant_id);
create index idx_client_tags_tag on public.client_tags(tenant_id, tag);

alter table public.client_tags enable row level security;

create policy "Tenant isolation for client_tags"
  on public.client_tags for all
  using (tenant_id = public.get_user_tenant_id())
  with check (tenant_id = public.get_user_tenant_id());
