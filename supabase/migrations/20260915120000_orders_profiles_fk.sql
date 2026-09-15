-- Fix: "Could not find a relationship between 'orders' and 'profiles'
--       in the schema cache" (PGRST200) pada halaman admin.
--
-- orders.customer_id semula references auth.users(id). PostgREST hanya
-- bisa me-resolve relasi embed (mis. profiles:profiles!customer_id(...))
-- melalui foreign key langsung antar tabel di schema public. Karena
-- orders tidak memiliki FK ke public.profiles, embed gagal.
--
-- Migration ini memindahkan FK orders.customer_id -> public.profiles(id).
-- Perilaku on delete tetap set null: saat user dihapus, auth.users cascade
-- menghapus profiles, lalu FK ini mengosongkan customer_id di orders.

-- 1. Hapus FK lama yang menunjuk ke auth.users (nama constraint bisa
--    berbeda-beda tergantung cara tabel dibuat)
do $$
declare
  fk_record record;
begin
  for fk_record in
    select conname
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) like 'FOREIGN KEY (customer_id) REFERENCES auth.users%'
  loop
    execute format('alter table public.orders drop constraint %I', fk_record.conname);
  end loop;
end $$;

-- 2. Tambahkan FK ke public.profiles (idempotent)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and contype = 'f'
      and conname = 'orders_customer_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_customer_id_fkey
      foreign key (customer_id) references public.profiles(id)
      on delete set null;
  end if;
end $$;

-- 3. Minta PostgREST me-reload schema cache agar relasi baru langsung
--    terdeteksi (otomatis via SQL Editor Supabase; eksplisit untuk
--    self-hosted / local dev)
notify pgrst, 'reload schema';

create index if not exists idx_orders_customer_id on public.orders(customer_id);