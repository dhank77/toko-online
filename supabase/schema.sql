-- ============================================
-- Schema: Categories + Products (IDR prices)
-- ============================================

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
  price numeric(12,2) not null,  -- harga dalam Rupiah (IDR)
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
  price_adjustment numeric(12,2) default 0,  -- penyesuaian harga dalam Rupiah (IDR)
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

-- Hero Slides table (Homepage Carousel)
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

drop trigger if exists update_hero_slides_updated_at on public.hero_slides;
create trigger update_hero_slides_updated_at
  before update on public.hero_slides
  for each row execute function public.update_updated_at();

create index if not exists idx_hero_slides_sort_order on public.hero_slides(sort_order);

alter table public.hero_slides disable row level security;

-- Indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_categories_slug on public.categories(slug);

-- Seed categories
insert into public.categories (name, slug, icon) values
  ('Tech Gear', 'tech-gear', 'laptop_mac'),
  ('Dekorasi Kantor', 'office-decor', 'chair'),
  ('Perangkat Wearable', 'wearables', 'watch'),
  ('Produktivitas', 'productivity', 'auto_stories'),
  ('Pakaian', 'apparel', 'checkroom'),
  ('Kesehatan', 'wellness', 'coffee'),
  ('Kebugaran', 'fitness', 'fitness_center')
on conflict (slug) do nothing;

-- Seed products (prices in IDR)
insert into public.products (name, slug, description, price, image_url, badge, rating, review_count, category_id, in_stock) values
  (
    'Mouse Wireless Pro',
    'wireless-pro-mouse',
    'Mouse wireless presisi dengan lekuk ergonomis dan teknologi klik senyap. Dilengkapi warna hitam matte dengan pencahayaan RGB aksen yang halus.',
    1248200,
    'https://placehold.co/600x400?text=Mouse%20Wireless%20Pro',
    'Peringkat Teratas',
    4.7,
    312,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Kursi ErgoLift',
    'ergolift-chair',
    'Kursi kantor ergonomis berprestasi dengan dukungan lumbar adaptif dan anyaman breathable. Dirancang untuk sesi kerja 12 jam.',
    9464200,
    'https://placehold.co/600x400?text=Kursi%20ErgoLift',
    'Paling Laris',
    4.8,
    892,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Smartwatch Ultra',
    'smart-watch-ultra',
    'Smartwatch fitness premium dengan casing titanium dan layar AMOLED selalu menyala. Tahan air hingga 100 meter.',
    7094200,
    'https://placehold.co/600x400?text=Smartwatch%20Ultra',
    'Baru',
    4.6,
    567,
    (select id from public.categories where slug = 'wearables'),
    true
  ),
  (
    'Planner Fokus Pro',
    'focus-planner-pro',
    'Buku planner harian berkulit kulit dengan kerangka produktivitas terpandu dan penutup magnet. Dilengkapi spread goal-setting triwulanan.',
    600400,
    'https://placehold.co/600x400?text=Planner%20Fokus%20Pro',
    null,
    4.4,
    203,
    (select id from public.categories where slug = 'productivity'),
    true
  ),
  (
    'Sweater Rajutan Merino',
    'merino-crew-sweater',
    'Sweater wol merino dengan potongan longgar dalam warna charcoal heather. Sentuhan lembut dengan manset rajutan dan bahu jatuh.',
    1501000,
    'https://placehold.co/600x400?text=Sweater%20Rajutan%20Merino',
    null,
    4.3,
    178,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Set Seduh Keramik',
    'ceramic-pour-over-set',
    'Kit seduh kopi minimalis dengan kendi kaca borosilicate dan dripper keramik putih matte. Dapat menyajikan 2-3 cangkir.',
    1011200,
    'https://placehold.co/600x400?text=Set%20Seduh%20Keramik',
    'Peringkat Teratas',
    4.8,
    421,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Dumbel Adjustable',
    'adjustable-dumbbells',
    'Pasangan dumbel adjustable hemat tempat dengan sistem berat cepat dari 5 hingga 52.5 lbs. Pegangan grip berlapis karet.',
    5514200,
    'https://placehold.co/600x400?text=Dumbel%20Adjustable',
    null,
    4.5,
    634,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Keypad Mekanikal',
    'mechanical-keypad',
    'Keypad mekanikal ringkas 16 tombol dengan switch hot-swappable dan frame aluminum CNC. Dapat diprogram melalui firmware open-source.',
    1406200,
    'https://placehold.co/600x400?text=Keypad%20Mekanikal',
    null,
    4.6,
    291,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Mat Meja XL',
    'desk-mat-xl',
    'Mat meja ekstra besar dalam warna abu-abu gelap dengan tepi jahitan. Permukaan polyurethane tahan air melindungi ruang kerja Anda.',
    663600,
    'https://placehold.co/600x400?text=Mat%20Meja%20XL',
    null,
    4.2,
    156,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Dompet Kartu Kulit',
    'leather-card-wallet',
    'Dompet kartu tipis lipat dua dalam kulit cognac full-grain. Dapat menampung hingga 8 kartu dengan kompartemen uang tengah.',
    1027000,
    'https://placehold.co/600x400?text=Dompet%20Kartu%20Kulit',
    null,
    4.1,
    89,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Earbuds Anti-Noise',
    'noise-cancel-earbuds',
    'Earbuds true wireless ringkas dengan pembatalan bising aktif hibrida dan mode transparansi. Baterai 8 jam dengan casing pengisian nirkabel.',
    2512200,
    'https://placehold.co/600x400?text=Earbuds%20Anti-Noise',
    'Baru',
    4.4,
    445,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Rangka Meja Berdiri',
    'standing-desk-frame',
    'Rangka meja berdiri elektrik motor ganda dengan preset memori yang dapat diprogram dan sensor anti-tabrakan. Menopang hingga 220 lbs.',
    6778200,
    'https://placehold.co/600x400?text=Rangka%20Meja%20Berdiri',
    null,
    4.7,
    723,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Band Pelacak Kebugaran',
    'fitness-tracker-band',
    'Band kebugaran ringan dengan pemantauan detak jantung berkelanjutan dan pelacakan tidur. Baterai enam bulan dalam sekali pengisian.',
    774200,
    'https://placehold.co/600x400?text=Band%20Pelacak%20Kebugaran',
    null,
    4,
    198,
    (select id from public.categories where slug = 'wearables'),
    true
  ),
  (
    'Lampu Meja Minimalis',
    'minimalist-desk-lamp',
    'Lampu meja LED berbentuk skulptural dengan suhu warna yang dapat diatur dan dasar pengisian nirkabel. Konstruksi aluminium anodized.',
    2038200,
    'https://placehold.co/600x400?text=Lampu%20Meja%20Minimalis',
    'Peringkat Teratas',
    4.9,
    876,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Ransel Kanvas',
    'canvas-backpack',
    'Ransel kanvas lapis lilin tahan cuaca dengan kompartemen laptop berlapis dan aksen kulit. Kapasitas 25L untuk perjalanan harian.',
    2291000,
    'https://placehold.co/600x400?text=Ransel%20Kanvas',
    null,
    4.3,
    267,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Botol Air Isolasi',
    'insulated-water-bottle',
    'Botol air stainless steel isolasi tiga lapis yang menjaga minuman tetap dingin selama 24 jam atau panas selama 12 jam. Mulut lebar untuk es.',
    537200,
    'https://placehold.co/600x400?text=Botol%20Air%20Isolasi',
    null,
    4.6,
    1023,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Set Ban Resistansi',
    'resistance-band-set',
    'Set lima ban resistansi loop dengan jangkar pintu dan tali pergelangan kaki. Resistensi bertingkat dari ringan hingga ekstra berat.',
    458200,
    'https://placehold.co/600x400?text=Set%20Ban%20Resistansi',
    null,
    4.2,
    534,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Pad Pengisian Nirkabel',
    'wireless-charging-pad',
    'Pad pengisian nirkabel cepat dengan output 15W dan deteksi benda asing. Kompatibel dengan semua perangkat berkemampuan Qi.',
    616200,
    'https://placehold.co/600x400?text=Pad%20Pengisian%20Nirkabel',
    null,
    4.1,
    312,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Kemeja Linen',
    'linen-button-down',
    'Kemeja linen button-down longgar dalam warna oat alami. Kain breathable yang sempurna untuk layering musim panas atau hari santai.',
    1390400,
    'https://placehold.co/600x400?text=Kemeja%20Linen',
    null,
    4.4,
    145,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Bantal Meditasi',
    'meditation-cushion',
    'Bantal meditasi gaya zafu berisi sekam buckwheat organik. Sarung dapat dilepas dan dicuci mesin dalam warna abu-abu batu.',
    916400,
    'https://placehold.co/600x400?text=Bantal%20Meditasi',
    null,
    4.5,
    289,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Timbangan Cerdas',
    'smart-scale',
    'Timbangan komposisi tubuh cerdas dengan 14 pengukuran biometrik dan sinkronisasi aplikasi. Bagian atas kaca tempered elegan dengan layar tersembunyi.',
    774200,
    'https://placehold.co/600x400?text=Timbangan%20Cerdas',
    'Paling Laris',
    4.6,
    1456,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Monitor Portabel',
    'portable-monitor',
    'Monitor USB-C portabel 15,6 inci dengan panel IPS 1080p dan kickstand bawaan. Sempurna untuk produktivitas layar ganda saat bepergian.',
    3934200,
    'https://placehold.co/600x400?text=Monitor%20Portabel',
    null,
    4.5,
    678,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Syal Campuran Wol',
    'wool-blend-scarf',
    'Syal campuran wol abadi dalam warna kamel dengan tepi gulung tangan. Panjang ekstra untuk berbagai pilihan gaya.',
    869000,
    'https://placehold.co/600x400?text=Syal%20Campuran%20Wol',
    null,
    4.3,
    167,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Mat Yoga Premium',
    'yoga-mat-premium',
    'Mat yoga premium setebal 6mm dengan penanda alignment dan tekstur anti-slip. Terbuat dari bahan TPE ramah lingkungan.',
    1074400,
    'https://placehold.co/600x400?text=Mat%20Yoga%20Premium',
    'Peringkat Teratas',
    4.7,
    934,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Set Pena Emas',
    'pen-set-gold',
    'Set tiga pena bolpoin isi ulang dengan aksen berlapis emas dan tinta gel hitam. Hadir dalam kotak hadiah magnetik.',
    711000,
    'https://placehold.co/600x400?text=Set%20Pena%20Emas',
    null,
    4.4,
    223,
    (select id from public.categories where slug = 'productivity'),
    true
  ),
  (
    'Speaker Bluetooth',
    'bluetooth-speaker',
    'Speaker Bluetooth portabel dengan suara 360 derajat dan baterai 20 jam. Tahan air IP67 untuk petualangan luar ruangan.',
    1248200,
    'https://placehold.co/600x400?text=Speaker%20Bluetooth',
    null,
    4.3,
    567,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Stand Monitor Riser',
    'monitor-stand-riser',
    'Stand monitor riser bambu solid dengan laci penyimpanan untuk keyboard dan perlengkapan kantor. Dilengkapi lubang manajemen kabel.',
    853200,
    'https://placehold.co/600x400?text=Stand%20Monitor%20Riser',
    null,
    4.5,
    389,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Jogger Chino',
    'chino-joggers',
    'Interpretasi modern chino klasik dengan gaya jogger meruncing. Twill katun stretch dengan pinggang elastis dan saku beritsleting.',
    1232400,
    'https://placehold.co/600x400?text=Jogger%20Chino',
    null,
    4.2,
    234,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Difuser Minyak Esensial',
    'essential-oil-diffuser',
    'Difuser minyak esensial ultrasonik minimalis dengan pencahayaan ambient. Operasi senyap untuk kamar tidur dan kantor.',
    537200,
    'https://placehold.co/600x400?text=Difuser%20Minyak%20Esensial',
    null,
    4.6,
    445,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Roller Busa',
    'foam-roller',
    'Roller busa berdensitas tinggi dengan permukaan bertekstur untuk pijat jaringan dalam. Panjang 18 inci dengan inti padat.',
    442400,
    'https://placehold.co/600x400?text=Roller%20Busa',
    null,
    4.4,
    789,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Hub USB-C 7-dalam-1',
    'usb-c-hub-7-in-1',
    'Hub USB-C aluminium ringkas dengan HDMI 4K, pembaca kartu SD, dan tiga port USB-A. Plug-and-play tanpa perlu driver.',
    932200,
    'https://placehold.co/600x400?text=Hub%20USB-C%207-dalam-1',
    null,
    4.5,
    1234,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Kaos Polo Klasik',
    'polo-shirt-classic',
    'Kaos polo pique potongan klasik dalam warna navy dengan kancing mother-of-pearl. Katun pra-susut dengan kerah yang diperkuat.',
    1027000,
    'https://placehold.co/600x400?text=Kaos%20Polo%20Klasik',
    null,
    4.1,
    312,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Selimut Berpemberat',
    'weighted-blanket',
    'Selimut berpemberat 15 pon dengan isian manik kaca dan sarung katun breathable. Mendorong tidur lebih nyenyak dan mengurangi kecemasan.',
    1406200,
    'https://placehold.co/600x400?text=Selimut%20Berpemberat',
    'Paling Laris',
    4.8,
    1567,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Set Buku Catatan A5',
    'notebook-set-a5',
    'Set tiga buku catatan A5 bertitik dengan kertas 180gsm dan jilid lay-flat. Ideal untuk journaling dan bullet journaling.',
    379200,
    'https://placehold.co/600x400?text=Set%20Buku%20Catatan%20A5',
    null,
    4.5,
    678,
    (select id from public.categories where slug = 'productivity'),
    true
  ),
  (
    'Jaket Denim',
    'denim-jacket',
    'Jaket denim klasik dengan potongan slim modern. Dilengkapi saku dada, penutup kancing, dan detail selvedge.',
    2022400,
    'https://placehold.co/600x400?text=Jaket%20Denim',
    null,
    4.3,
    145,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Ban Resistansi',
    'resistance-bands',
    'Set lima ban resistansi loop dengan jangkar pintu dan tali pergelangan kaki. Resistensi bertingkat dari ringan hingga ekstra berat.',
    458200,
    'https://placehold.co/600x400?text=Ban%20Resistansi',
    null,
    4.2,
    534,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Bohlam Pintar',
    'smart-light-bulb',
    'Bohlam pintar Wi-Fi dengan 16 juta warna dan cahaya putih yang dapat disetel. Kompatibel suara dengan Alexa dan Google Assistant.',
    300200,
    'https://placehold.co/600x400?text=Bohlam%20Pintar',
    null,
    4,
    2345,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Buku Kulit',
    'leather-notebook',
    'Buku catatan bersampul kulit buatan tangan dengan kertas isi ulang. Menua dengan indah membentuk patina yang kaya seiring waktu.',
    758400,
    'https://placehold.co/600x400?text=Buku%20Kulit',
    null,
    4.6,
    289,
    (select id from public.categories where slug = 'productivity'),
    true
  ),
  (
    'Lompat Tali Speed',
    'jump-rope-speed',
    'Lompat tali speed profesional dengan ball bearing dan panjang tali yang dapat disesuaikan. Pegangan aluminium ringan.',
    347600,
    'https://placehold.co/600x400?text=Lompat%20Tali%20Speed',
    null,
    4.4,
    567,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Keyboard Mekanikal',
    'mechanical-keyboard',
    'Keyboard mekanikal 75% ringkas dengan switch hot-swappable dan pencahayaan RGB per tombol. Konektivitas USB-C dengan keycap PBT.',
    2354200,
    'https://placehold.co/600x400?text=Keyboard%20Mekanikal',
    'Peringkat Teratas',
    4.7,
    890,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Organizer Meja',
    'desk-organizer',
    'Organizer meja modular dengan kompartemen untuk pena, sticky notes, dan ponsel. Terbuat dari bambu berkelanjutan.',
    663600,
    'https://placehold.co/600x400?text=Organizer%20Meja',
    null,
    4.3,
    345,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Hoodie Katun',
    'cotton-hoodie',
    'Hoodie katun tebal dengan potongan longgar dan interior brushed. Dilengkapi saku kanguru dan manset ribbed.',
    1406200,
    'https://placehold.co/600x400?text=Hoodie%20Katun',
    null,
    4.5,
    678,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Pembersih Udara Mini',
    'air-purifier-mini',
    'Pembersih udara HEPA ringkas untuk meja dan ruangan kecil. Menghilangkan 99,97% partikel udara dengan operasi senyap.',
    1248200,
    'https://placehold.co/600x400?text=Pembersih%20Udara%20Mini',
    null,
    4.4,
    456,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Roller Pergelangan Tangan',
    'wrist-roller',
    'Alat latih lengan bawah dengan pelat beban yang dapat disesuaikan dan pegangan anti-slip. Membangun kekuatan genggaman dan daya tahan pergelangan tangan.',
    284400,
    'https://placehold.co/600x400?text=Roller%20Pergelangan%20Tangan',
    null,
    4.1,
    123,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Stand Papan Tulis',
    'whiteboard-stand',
    'Stand papan tulis portabel dengan ketinggian yang dapat diatur dan nampan spidol. Sempurna untuk kantor rumahan dan ruang kelas.',
    1027000,
    'https://placehold.co/600x400?text=Stand%20Papan%20Tulis',
    null,
    4.2,
    234,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Sepatu Lari',
    'running-shoes',
    'Sepatu lari ringan dengan bantalan responsif dan upper mesh breathable. Dirancang untuk latihan harian di jalan dan lintasan.',
    2038200,
    'https://placehold.co/600x400?text=Sepatu%20Lari',
    'Baru',
    4.6,
    789,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Botol Infuser Teh',
    'tea-infuser-bottle',
    'Botol teh kaca dinding ganda dengan infuser stainless steel bawaan. Menjaga teh tetap panas selama berjam-jam dan muat di cup holder mobil.',
    410800,
    'https://placehold.co/600x400?text=Botol%20Infuser%20Teh',
    null,
    4.5,
    345,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Mat Mouse Ergonomis',
    'ergonomic-mouse-pad',
    'Mat mouse ergonomis berisi gel dengan penyangga pergelangan tangan. Alas anti-slip dan permukaan tracking halus untuk kontrol presisi.',
    300200,
    'https://placehold.co/600x400?text=Mat%20Mouse%20Ergonomis',
    null,
    4.3,
    567,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Tas Kanvas',
    'canvas-tote-bag',
    'Tas tote kanvas tugas berat dengan jahitan diperkuat dan saku interior. Sempurna untuk belanjaan, buku, atau perlengkapan pantai.',
    505600,
    'https://placehold.co/600x400?text=Tas%20Kanvas',
    null,
    4.4,
    890,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Kettlebell 16kg',
    'kettlebell-16kg',
    'Kettlebell besi cor dengan lapisan powder-coat halus dan pegangan lebar. Sempurna untuk swing, squat, dan Turkish get-up.',
    1027000,
    'https://placehold.co/600x400?text=Kettlebell%2016kg',
    null,
    4.6,
    456,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Kamera Web 4K',
    'webcam-4k',
    'Kamera web 4K dengan fokus otomatis, ring light bawaan, dan dua mikrofon peredam bising. Termasuk dudukan klip atau stand.',
    1564200,
    'https://placehold.co/600x400?text=Kamera%20Web%204K',
    null,
    4.5,
    1234,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Dasi Sutra',
    'silk-tie',
    'Dasi sutra murni dengan tepi finishing tangan dan pola herringbone halus. Tambahan serbaguna untuk lemari profesional mana pun.',
    758400,
    'https://placehold.co/600x400?text=Dasi%20Sutra',
    null,
    4.2,
    167,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Masker Tidur',
    'sleep-mask',
    'Masker tidur sutra berkontur yang menghalangi cahaya tanpa menekan mata. Tali dapat disesuaikan dan dapat dicuci mesin.',
    379200,
    'https://placehold.co/600x400?text=Masker%20Tidur',
    null,
    4.7,
    2345,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Tabung Resistansi',
    'resistance-tubes',
    'Set lima tabung resistansi dengan jangkar pintu, pegangan, dan tali pergelangan kaki. Ideal untuk latihan seluruh tubuh di mana saja.',
    553000,
    'https://placehold.co/600x400?text=Tabung%20Resistansi',
    null,
    4.3,
    678,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Keyboard Nirkabel',
    'wireless-keyboard',
    'Keyboard nirkabel ramping dengan tombol mekanisme gunting dan pairing Bluetooth multi-perangkat. Baterai isi ulang dengan daya tahan 90 hari.',
    1090200,
    'https://placehold.co/600x400?text=Keyboard%20Nirkabel',
    null,
    4.4,
    567,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Stand Laptop',
    'laptop-stand',
    'Stand laptop aluminium yang dapat disesuaikan dengan lubang ventilasi. Mengangkat layar setinggi mata untuk postur lebih baik.',
    932200,
    'https://placehold.co/600x400?text=Stand%20Laptop',
    null,
    4.6,
    890,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Celana Jogger',
    'jogger-pants',
    'Celana jogger meruncing dengan pinggang elastis dan saku beritsleting. Terbuat dari campuran katun stretch untuk kenyamanan sepanjang hari.',
    853200,
    'https://placehold.co/600x400?text=Celana%20Jogger',
    null,
    4.2,
    345,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Bola Pijat',
    'massage-ball',
    'Bola pijat bertekstur untuk pelepasan titik pemicu dan pelepasan myofascial. Ukuran ringkas sempurna untuk bepergian.',
    252800,
    'https://placehold.co/600x400?text=Bola%20Pijat',
    null,
    4.5,
    1234,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Buku Catatan Kulit',
    'notebook-leather',
    'Buku catatan bersampul kulit buatan tangan dengan kertas isi ulang. Menua dengan indah membentuk patina yang kaya seiring waktu.',
    758400,
    'https://placehold.co/600x400?text=Buku%20Catatan%20Kulit',
    null,
    4.6,
    289,
    (select id from public.categories where slug = 'productivity'),
    true
  ),
  (
    'Powerbank 20000',
    'power-bank-20000',
    'Powerbank berkapasitas tinggi 20000mAh dengan dua port USB-C. Mengisi laptop, tablet, dan ponsel secara bersamaan.',
    932200,
    'https://placehold.co/600x400?text=Powerbank%2020000',
    null,
    4.4,
    1567,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Beanie Wol',
    'wool-beanie',
    'Beanie wol merino rajutan halus dengan lipatan cuff. Lembut, hangat, dan breathable untuk layering cuaca dingin.',
    505600,
    'https://placehold.co/600x400?text=Beanie%20Wol',
    null,
    4.3,
    234,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Palang Pull-Up',
    'pull-up-bar',
    'Palang pull-up pintu dengan posisi multi-grip dan pegangan berbantal. Menopang hingga 300 lbs dengan mekanisme penguncian aman.',
    711000,
    'https://placehold.co/600x400?text=Palang%20Pull-Up',
    null,
    4.5,
    890,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Stand Tablet',
    'tablet-stand',
    'Stand tablet aluminium serbaguna dengan sudut pandang yang dapat disesuaikan. Kompatibel dengan tablet 7 hingga 13 inci.',
    616200,
    'https://placehold.co/600x400?text=Stand%20Tablet',
    null,
    4.4,
    567,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Kaos Grafis',
    'graphic-tee',
    'Kaos grafis katun tebal dengan potongan longgar. Kain pra-susut dengan tekstur lembut.',
    553000,
    'https://placehold.co/600x400?text=Kaos%20Grafis',
    null,
    4.1,
    456,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Lilin Aromaterapi',
    'aromatherapy-candle',
    'Lilin aromaterapi lilin kedelai dengan minyak esensial lavender dan eukaliptus. Terbakar bersih selama 50 jam.',
    442400,
    'https://placehold.co/600x400?text=Lilin%20Aromaterapi',
    null,
    4.6,
    1234,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Roller Perut',
    'ab-roller',
    'Roller perut dengan alas lutut dan pegangan anti-slip. Menargetkan otot inti untuk latihan perut yang efektif.',
    347600,
    'https://placehold.co/600x400?text=Roller%20Perut',
    null,
    4.3,
    678,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Mouse Wireless',
    'mouse-wireless',
    'Mouse wireless presisi dengan lekuk ergonomis dan teknologi klik senyap. Dilengkapi warna hitam matte dengan pencahayaan RGB aksen yang halus.',
    1248200,
    'https://placehold.co/600x400?text=Mouse%20Wireless',
    null,
    4.7,
    312,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Pad Meja',
    'desk-pad',
    'Pad meja extended dengan permukaan micro-weave halus dan alas karet anti-slip. Melindungi meja Anda dan menyediakan ruang mouse yang luas.',
    458200,
    'https://placehold.co/600x400?text=Pad%20Meja',
    null,
    4.5,
    890,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Celana Pendek Chino',
    'chino-shorts',
    'Celana pendek chino klasik dengan mid-rise nyaman dan inseam 9 inci. Twill katun stretch dengan lubang sabuk dan saku beritsleting.',
    916400,
    'https://placehold.co/600x400?text=Celana%20Pendek%20Chino',
    null,
    4.2,
    234,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Tas Hidrasi',
    'hydration-pack',
    'Tas hidrasi ringan dengan reservoir 2 liter dan tali yang dapat disesuaikan. Ideal untuk lari, hiking, dan bersepeda.',
    1027000,
    'https://placehold.co/600x400?text=Tas%20Hidrasi',
    null,
    4.4,
    567,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Light Bar Monitor',
    'monitor-light-bar',
    'Light bar monitor yang dipasang di layar dengan kecerahan dan suhu warna yang dapat diatur. Mengurangi silau dan kelelahan mata.',
    1406200,
    'https://placehold.co/600x400?text=Light%20Bar%20Monitor',
    null,
    4.6,
    789,
    (select id from public.categories where slug = 'office-decor'),
    true
  ),
  (
    'Kemeja Slim',
    'dress-shirt-slim',
    'Kemeja slim-fit anti-setrika dalam warna biru muda. Katun anti-kusut dengan kerah spread dan manset French.',
    1343000,
    'https://placehold.co/600x400?text=Kemeja%20Slim',
    null,
    4.3,
    345,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Roller Busa Lembut',
    'foam-roller-soft',
    'Roller busa berdensitas lembut untuk pemulihan otot ringan dan latihan fleksibilitas. Panjang 18 inci dengan permukaan bertekstur.',
    379200,
    'https://placehold.co/600x400?text=Roller%20Busa%20Lembut',
    null,
    4.2,
    456,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Buku Catatan Dot Grid',
    'notebook-dot-grid',
    'Buku catatan A5 dot grid dengan 160 halaman dan jilid lay-flat. Sempurna untuk bullet journaling dan sketsa.',
    284400,
    'https://placehold.co/600x400?text=Buku%20Catatan%20Dot%20Grid',
    null,
    4.5,
    1234,
    (select id from public.categories where slug = 'productivity'),
    true
  ),
  (
    'Earbuds Nirkabel',
    'wireless-earbuds',
    'Earbuds true wireless ringkas dengan bass dalam dan total baterai 24 jam. Tahan air IPX5 untuk olahraga.',
    1406200,
    'https://placehold.co/600x400?text=Earbuds%20Nirkabel',
    null,
    4.4,
    2345,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Keyboard Bambu',
    'bamboo-keyboard',
    'Keyboard nirkabel ramping dengan aksen bambu dan tombol low-profile. Desain ramah lingkungan dengan pairing multi-perangkat.',
    1564200,
    'https://placehold.co/600x400?text=Keyboard%20Bambu',
    'Baru',
    4.6,
    189,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Kardigan Wol',
    'wool-cardigan',
    'Kardigan wol merino potongan longgar dengan kancing tanduk dan saku tempel. Sempurna untuk layering di cuaca sejuk.',
    2607000,
    'https://placehold.co/600x400?text=Kardigan%20Wol',
    null,
    4.7,
    312,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Lompat Tali',
    'jump-rope',
    'Lompat tali speed profesional dengan ball bearing dan panjang tali yang dapat disesuaikan. Pegangan aluminium ringan.',
    347600,
    'https://placehold.co/600x400?text=Lompat%20Tali',
    null,
    4.4,
    567,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Balok Yoga',
    'yoga-block',
    'Balok yoga busa EVA berdensitas tinggi dengan tepi miring. Memberikan dukungan dan stabilitas untuk peregangan lebih dalam.',
    252800,
    'https://placehold.co/600x400?text=Balok%20Yoga',
    null,
    4.5,
    890,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Kacamata Hitam Polarized',
    'sunglasses-polarized',
    'Kacamata hitam polarized dengan frame titanium ringan dan perlindungan UV400. Gaya aviator klasik untuk penggunaan sehari-hari.',
    1975000,
    'https://placehold.co/600x400?text=Kacamata%20Hitam%20Polarized',
    null,
    4.3,
    456,
    (select id from public.categories where slug = 'wearables'),
    true
  ),
  (
    'Sabuk Kulit',
    'leather-belt',
    'Sabuk kulit full-grain dengan gesper perak brushed. Buatan tangan dengan jahitan presisi dan desain abadi.',
    869000,
    'https://placehold.co/600x400?text=Sabuk%20Kulit',
    null,
    4.6,
    789,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Ketel Elektrik',
    'electric-kettle',
    'Ketel elektrik suhu variabel dengan fungsi tahan panas dan leher angsa. Sempurna untuk kopi pour-over dan teh.',
    1248200,
    'https://placehold.co/600x400?text=Ketel%20Elektrik',
    null,
    4.7,
    1234,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Alat Latih Genggaman',
    'grip-trainer',
    'Alat latih genggaman resistensi variabel dengan dial yang dapat disesuaikan. Membangun kekuatan tangan dan lengan bawah untuk panjat tebing dan aktivitas harian.',
    300200,
    'https://placehold.co/600x400?text=Alat%20Latih%20Genggaman',
    null,
    4.4,
    567,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Sarung Laptop',
    'laptop-sleeve',
    'Sarung laptop neoprene berbantal dengan lapisan faux-fur. Melindungi dari goresan dan benturan ringan dengan profil ramping.',
    616200,
    'https://placehold.co/600x400?text=Sarung%20Laptop',
    null,
    4.5,
    890,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Celana Pendek Lari',
    'running-shorts',
    'Celana pendek lari ringan dengan lapisan brief bawaan dan saku beritsleting. Kain penyerap keringat dengan detail reflektif.',
    711000,
    'https://placehold.co/600x400?text=Celana%20Pendek%20Lari',
    null,
    4.3,
    345,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Lilin Wangi',
    'scented-candle',
    'Lilin lilin kedelai tuangan tangan dengan aroma cedar dan bergamot. Dikemas dalam wadah keramik yang dapat digunakan kembali.',
    505600,
    'https://placehold.co/600x400?text=Lilin%20Wangi',
    null,
    4.6,
    1234,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Kettlebell 24kg',
    'kettlebell-24kg',
    'Kettlebell besi cor dengan lapisan powder-coat halus dan pegangan lebar. Sempurna untuk latihan kekuatan tingkat lanjut.',
    1406200,
    'https://placehold.co/600x400?text=Kettlebell%2024kg',
    null,
    4.7,
    456,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Mikrofon USB',
    'microphone-usb',
    'Mikrofon kondensor USB profesional dengan pola pickup cardioid dan pop filter bawaan. Sempurna untuk streaming dan podcasting.',
    2038200,
    'https://placehold.co/600x400?text=Mikrofon%20USB',
    null,
    4.8,
    789,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Syal Wol',
    'wool-scarf',
    'Syal campuran wol abadi dalam warna kamel dengan tepi gulung tangan. Panjang ekstra untuk berbagai pilihan gaya.',
    869000,
    'https://placehold.co/600x400?text=Syal%20Wol',
    null,
    4.3,
    167,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Bangku Meditasi',
    'meditation-bench',
    'Bangku meditasi lipat dengan dudukan miring dan bantal empuk. Mendukung duduk bersila dengan nyaman.',
    1232400,
    'https://placehold.co/600x400?text=Bangku%20Meditasi',
    null,
    4.5,
    234,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Powerbank',
    'power-bank',
    'Powerbank ringkas dengan kapasitas 10000mAh dan pengisian cepat. Muat mudah di saku atau tas untuk pengisian saat bepergian.',
    458200,
    'https://placehold.co/600x400?text=Powerbank',
    null,
    4.3,
    2345,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Chino Slim',
    'chinos-slim',
    'Celana chino slim-fit dalam warna batu dengan stretch nyaman. Potongan modern dengan mid-rise dan kaki lurus.',
    1137600,
    'https://placehold.co/600x400?text=Chino%20Slim',
    null,
    4.4,
    567,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Roller Busa Sedang',
    'foam-roller-medium',
    'Roller busa berdensitas sedang untuk pemulihan otot umum. Panjang 18 inci dengan permukaan halus.',
    316000,
    'https://placehold.co/600x400?text=Roller%20Busa%20Sedang',
    null,
    4.3,
    890,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Buku Catatan Saku',
    'pocket-notebook',
    'Buku catatan ukuran saku ringkas dengan 192 halaman kertas bertitik. Muat di saku jeans untuk catatan saat bepergian.',
    189600,
    'https://placehold.co/600x400?text=Buku%20Catatan%20Saku',
    null,
    4.4,
    1234,
    (select id from public.categories where slug = 'productivity'),
    true
  ),
  (
    'Steker Pintar',
    'smart-plug',
    'Steker pintar Wi-Fi dengan pemantauan energi dan penjadwalan. Bekerja dengan Alexa dan Google Assistant untuk kontrol suara.',
    237000,
    'https://placehold.co/600x400?text=Steker%20Pintar',
    'Paling Laris',
    4.5,
    4567,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Kemeja Denim',
    'denim-shirt',
    'Kemeja denim klasik dengan potongan modern. Dilengkapi saku dada, penutup kancing, dan detail selvedge.',
    1232400,
    'https://placehold.co/600x400?text=Kemeja%20Denim',
    null,
    4.2,
    234,
    (select id from public.categories where slug = 'apparel'),
    true
  ),
  (
    'Sepatu Lari Trail',
    'running-shoes-trail',
    'Sepatu lari trail dengan tapak agresif dan perlindungan rock plate. Membran tahan air untuk kepercayaan diri di segala medan.',
    2354200,
    'https://placehold.co/600x400?text=Sepatu%20Lari%20Trail',
    null,
    4.6,
    567,
    (select id from public.categories where slug = 'fitness'),
    true
  ),
  (
    'Set Teh',
    'tea-set',
    'Set teh keramik minimalis dengan teko dan empat cangkir. Finishing matte dalam warna putih hangat dengan tekstur halus.',
    1343000,
    'https://placehold.co/600x400?text=Set%20Teh',
    null,
    4.7,
    189,
    (select id from public.categories where slug = 'wellness'),
    true
  ),
  (
    'Keyboard Ergonomis',
    'ergonomic-keyboard',
    'Keyboard ergonomis split dengan tenting yang dapat disesuaikan dan kemiringan negatif. Mengurangi ketegangan pergelangan tangan saat mengetik lama.',
    2828200,
    'https://placehold.co/600x400?text=Keyboard%20Ergonomis',
    'Baru',
    4.6,
    345,
    (select id from public.categories where slug = 'tech-gear'),
    true
  ),
  (
    'Portofolio Kulit',
    'leather-portfolio',
    'Portofolio kulit mewah dengan organizer dokumen dan sarung tablet. Buatan tangan dari kulit Italia full-grain.',
    2923000,
    'https://placehold.co/600x400?text=Portofolio%20Kulit',
    null,
    4.8,
    234,
    (select id from public.categories where slug = 'productivity'),
    true
  );

on conflict (slug) do nothing;

-- RLS policies (disabled for anon key, enable if using auth)
alter table public.categories disable row level security;
alter table public.products disable row level security;
alter table public.product_variants disable row level security;
