-- Orders table for purchased products history
-- Jalankan di Supabase SQL Editor jika tabel 'orders' belum ada
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id varchar(255) not null unique,
  customer_id uuid references auth.users(id) on delete set null,
  gross_amount numeric(12,2) not null,
  status varchar(50) not null default 'pending',
  payment_type varchar(50),
  items jsonb default '[]'::jsonb,
  raw_response jsonb,
  transaction_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- trigger updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc'::text, now()); return new; end; $$;

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = customer_id);

drop policy if exists "Admin can read all orders" on public.orders;
create policy "Admin can read all orders"
  on public.orders for select
  to authenticated
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Service role bypass RLS, no insert policy needed for backend
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_order_id on public.orders(order_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
