-- Cart items table: persistent, per-user shopping cart.
-- Data is managed through the Express server (service_role), but RLS is enabled
-- so users can only access their own cart if reached via the anon key.

create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  selected boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id, variant_id)
);

drop trigger if exists update_cart_items_updated_at on public.cart_items;
create trigger update_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.update_updated_at();

create index if not exists idx_cart_items_user on public.cart_items(user_id);

alter table public.cart_items enable row level security;

create policy "Users can read own cart"
  on public.cart_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own cart"
  on public.cart_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own cart"
  on public.cart_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cart"
  on public.cart_items for delete
  to authenticated
  using (auth.uid() = user_id);
