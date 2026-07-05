
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories table
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products table
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  image_url text,
  badge text,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  category_id uuid references public.categories(id) on delete set null,
  in_stock boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product variants (size, color, etc)
create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_adjustment numeric(10,2) default 0,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Update trigger for products.updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

-- Indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_categories_slug on public.categories(slug);

-- Seed categories
insert into public.categories (name, slug, icon) values
  ('Tech Gear', 'tech-gear', 'laptop_mac'),
  ('Office Decor', 'office-decor', 'chair'),
  ('Wearables', 'wearables', 'watch'),
  ('Productivity', 'productivity', 'auto_stories'),
  ('Apparel', 'apparel', 'checkroom'),
  ('Wellness', 'wellness', 'coffee'),
  ('Fitness', 'fitness', 'fitness_center')
on conflict (slug) do nothing;

-- Seed products
insert into public.products (name, slug, description, price, image_url, badge, rating, review_count, category_id, in_stock) values
  (
    'Pro-Series Keyboard',
    'pro-series-keyboard',
    'A minimalist ergonomic designer keyboard on a clean white desk. The keyboard has a matte slate finish with soft teal backlit keys.',
    189.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuArf2L9PePb0IWOij45UZzSdbbis8Tj7M5xeT5bBjNnb31yV_FK1_uOz7SezA_WV2oh0oHuV75BdB3_vlUzZ4iNQgWi7kC3Ty8h02gzzgorS90LgNhxnUBLLqL1xEt3FGqQaOXI1-Mogueej-6FJBGjJm01MMebVR9sDcEi7y2geMgtBIUIFejE6kDXqJxCRqbbbfq_0gZ1jb4xikMQCatiFwe-YpD7_KdRC3NC128ITBUWqwGiE2ZtoA',
    'Top Rated',
    4.5,
    124,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Executive Portfolio',
    'executive-portfolio',
    'A luxury leather messenger bag in deep navy blue. The leather has a fine grain and metallic silver hardware.',
    245.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbPlRv0t7a6nWGaZrFEzksC6FuGCldUSU7LA8yaWtkzoaKVlB-n0-z5dFq97_Ao_sExKVxEZTj-xmmVYWu1VIMwicDtN71USeero-ll31FrK_GEQ4wgALbnLifDaROQg5s22gomR-EDZHkE5ERMkKcoLGURYZ5jIzwPxUVREefVKIKl_UxC1g9LSQIwJo4_w0XnDROlyjEjzyPkDVnM8S4QpsHzDpT6RZZ20cbkmiQK0nNx0186QhP7g',
    null,
    4.0,
    86,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Zenith Headphones',
    'zenith-headphones',
    'High-fidelity wireless noise-canceling headphones in matte white and silver. Styled on a marble stand with soft morning sunlight.',
    320.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAV4A9Wi0gT8CpUgh8xU8cq3iAGJGuxtAEzv0hz0HilIO1XsbfWKonCLijj2tedtBzQz2-0FwSXRdeB7dpbseR3UDvWUYcEVs6MK_VsdeZ3kYfGlHyAVHbgKBO3Y7dVUsT0m1WOnTOZZdxddNfI_rcuQdjOipnMj3ERUh7AANqw-Xqre0V2ObdfdOyEUfEWi5opK7h6XxU11CYeb06Miqzb2BXb2vopnudKCFZ25hLJvoAgL2VzQkWcPA',
    null,
    5.0,
    210,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'AquaSmart Flask',
    'aquasmart-flask',
    'A sleek smart hydration bottle made of frosted glass and brushed aluminum with digital temperature display.',
    55.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAQqa1XmxdGXs34FjocJXX95wKQJo23QC0X6_-JiLlnjFYoxwkouos4vS7qe6bAe3nqIUmMclrRf2_cwrJaO47d06jOqIiNpiCT6oGZCeWyvb_lrzHGhUx37KJrfy4_IebMcj1AF8v2-jJjs29wkPmsp7yiNKiV2dOJ_mfE9VkZcwEbVE9pDJ5PGAWMEo9PIeqAmqz7QETFookE78JEvWpiJGOzrfQDz7uNrXNeYd-tDO2jpwaUzZuY8w',
    null,
    4.5,
    54,
    (select id from public.categories where slug = 'wellness'),
    true
  )
on conflict (slug) do nothing;

-- RLS policies (disabled for anon key, enable if using auth)
alter table public.categories disable row level security;
alter table public.products disable row level security;
alter table public.product_variants disable row level security;
