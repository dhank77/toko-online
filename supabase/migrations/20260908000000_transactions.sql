-- Transactions table for Midtrans payment gateway
-- Run this via Supabase SQL Editor if table does not exist
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  order_id varchar(255) not null unique,
  user_id uuid references auth.users(id) on delete set null,
  gross_amount numeric(12, 2) not null,
  status varchar(50) default 'pending' not null,
  payment_type varchar(50),
  transaction_time timestamp with time zone,
  raw_response jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

drop policy if exists "Users can read own transactions" on public.transactions;
create policy "Users can read own transactions"
  on public.transactions for select
  to authenticated
  using (auth.uid() = user_id);

-- Service role bypasses RLS; no insert policy needed for service_role
create index if not exists idx_transactions_order_id on public.transactions(order_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_status on public.transactions(status);
