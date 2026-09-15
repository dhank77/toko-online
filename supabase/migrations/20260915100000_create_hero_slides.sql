-- ============================================
-- Schema: Hero Slides (Homepage Carousel)
-- ============================================

create table if not exists public.hero_slides (
  id uuid primary key default uuid_generate_v4(),
  img text not null,
  badge text,
  title text not null,
  description text,
  cta_label text,
  cta_href text,
  secondary_cta_label text,
  secondary_cta_href text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Update trigger for hero_slides.updated_at
drop trigger if exists update_hero_slides_updated_at on public.hero_slides;
create trigger update_hero_slides_updated_at
  before update on public.hero_slides
  for each row execute function public.update_updated_at();

-- Indexes
create index if not exists idx_hero_slides_sort_order on public.hero_slides(sort_order);

-- RLS (disabled for simplicity, like other tables)
alter table public.hero_slides disable row level security;

-- Seed: existing slides from HeroCarousel.jsx
insert into public.hero_slides (img, badge, title, description, cta_label, cta_href, secondary_cta_label, secondary_cta_href, sort_order, is_active) values
  (
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAO-hieItXxTEtuWTIPMA8h8av4IltYbz5HFBHERs2F53LOCmrq4Z7IAKI4413da786Y5uPioQzZDyvMyCfm2GhlRYlqchbaBva5VVAPO8X5jFbVNMthoGqsW2hvofVBi8C0KKre7jmoObbArFdU4VAomycFZefa-qlvIcyi03MmDUy3VGsQq2OWL-pUc4XmzXlBVeZpHrbugcXmgf-bN4xT7DtzALxRogHVjV9ItDSmGbHZ0hwmuJo6Q',
    'Rilis Musiman Terbatas',
    'Tingkatkan Kebutuhan Sehari-hari Anda',
    'Rasakan pertemuan antara efisiensi korporat dan ritel premium. Pilihan kurasi untuk profesional yang berwawasan.',
    'Jelajahi Kategori',
    '#kategori',
    'Lihat Flash Sale',
    '#flash-sale',
    1,
    true
  ),
  (
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Hna9rs8uQJdRN0mZWvBA6nHoaH0SdTte-SyeiFdX7aakkzjhTTF6hZeIAzVD6NvUXdgCkuwlrJmuWaZvN9CBJgrY6MPiY5lr0conYMlY1HtcF2vW_422dnFeJsEkWXdZDbC8MarGdTAZ-MSX1xtVe1n2RX-gH-uaR6KXtL3buOWMOKk_uTYpApfBsrC9QS-Q0BnU6zpa5VXc3loTdYyO7C99K8FtdkX6PCeToX9_sPEU1xNlAC257A',
    'Flash Sale Hari Ini',
    'Diskon Hingga 50% Sebelum Tengah Malam',
    'Hemat besar untuk kebutuhan workspace dan gadget pilihan. Stok terbatas, jangan sampai kehabisan.',
    'Lihat Flash Sale',
    '#flash-sale',
    null,
    null,
    2,
    true
  ),
  (
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZXYMewpkBoen-lTZLQKo3Hu-sE3TBgdyX4ODk_T3Jr7I8WCggX4cY411Y0MVzRjVnrenfvgugumkPVjFj1f8qiapcEA_Qaum9euY4mGt05HEP7lro7fSBPRRsNbhuz26PCW0qFzHHFZ1-8yJCitYUL3xS4opGRP-KHSWQ8GDaLcwHcWkoLGyx9wGG1z3_5MCvEJhhVEvoOHpYaZ-ekEMLGsWixoMhNnN9-IfY8xEJS-VX4_AzMeJCfA',
    'Baru di Tokorakyat.id',
    'Koleksi Terbaru Baru Saja Tiba',
    'Temukan produk paling baru dari brand favorit, dikirim cepat dengan garansi resmi.',
    'Belanja Sekarang',
    '#baru',
    null,
    null,
    3,
    true
  )
on conflict do nothing;
