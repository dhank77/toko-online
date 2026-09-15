-- ============================================
-- Migration: Update existing products to IDR prices + add images
-- Run this to update data already in the database
-- ============================================

-- Update all product prices from USD to IDR (1 USD ≈ Rp 15.800)
-- This multiplies existing prices by 15800 and rounds to nearest 100
UPDATE public.products
SET
  price = ROUND(price * 15800 / 100) * 100,
  image_url = 'https://placehold.co/600x400?text=' || encode(name::bytea, 'escape'),
  updated_at = timezone('utc'::text, now())
WHERE true;

-- ============================================
-- Atau update per produk secara spesifik:
-- ============================================

-- Tech Gear
UPDATE public.products SET price = 1248200, image_url = 'https://placehold.co/600x400?text=Mouse+Wireless+Pro' WHERE slug = 'wireless-pro-mouse';
UPDATE public.products SET price = 1406200, image_url = 'https://placehold.co/600x400?text=Keypad+Mekanikal' WHERE slug = 'mechanical-keypad';
UPDATE public.products SET price = 2512200, image_url = 'https://placehold.co/600x400?text=Earbuds+Anti+Noise' WHERE slug = 'noise-cancel-earbuds';
UPDATE public.products SET price = 774200, image_url = 'https://placehold.co/600x400?text=Pad+Pengisian+Nirkabel' WHERE slug = 'wireless-charging-pad';
UPDATE public.products SET price = 774200, image_url = 'https://placehold.co/600x400?text=Timbangan+Cerdas' WHERE slug = 'smart-scale';
UPDATE public.products SET price = 3934200, image_url = 'https://placehold.co/600x400?text=Monitor+Portabel' WHERE slug = 'portable-monitor';
UPDATE public.products SET price = 1248200, image_url = 'https://placehold.co/600x400?text=Speaker+Bluetooth' WHERE slug = 'bluetooth-speaker';
UPDATE public.products SET price = 932200, image_url = 'https://placehold.co/600x400?text=Hub+USB-C' WHERE slug = 'usb-c-hub-7-in-1';
UPDATE public.products SET price = 2354200, image_url = 'https://placehold.co/600x400?text=Keyboard+Mekanikal' WHERE slug = 'mechanical-keyboard';
UPDATE public.products SET price = 1248200, image_url = 'https://placehold.co/600x400?text=Pembersih+Udara+Mini' WHERE slug = 'air-purifier-mini';
UPDATE public.products SET price = 300200, image_url = 'https://placehold.co/600x400?text=Bohlam+Pintar' WHERE slug = 'smart-light-bulb';
UPDATE public.products SET price = 300200, image_url = 'https://placehold.co/600x400?text=Mat+Mouse+Ergonomis' WHERE slug = 'ergonomic-mouse-pad';
UPDATE public.products SET price = 1248200, image_url = 'https://placehold.co/600x400?text=Mouse+Wireless' WHERE slug = 'mouse-wireless';
UPDATE public.products SET price = 1564200, image_url = 'https://placehold.co/600x400?text=Kamera+Web+4K' WHERE slug = 'webcam-4k';
UPDATE public.products SET price = 1090200, image_url = 'https://placehold.co/600x400?text=Keyboard+Nirkabel' WHERE slug = 'wireless-keyboard';
UPDATE public.products SET price = 932200, image_url = 'https://placehold.co/600x400?text=Sarung+Laptop' WHERE slug = 'laptop-sleeve';
UPDATE public.products SET price = 1406200, image_url = 'https://placehold.co/600x400?text=Earbuds+Nirkabel' WHERE slug = 'wireless-earbuds';
UPDATE public.products SET price = 1564200, image_url = 'https://placehold.co/600x400?text=Keyboard+Bambu' WHERE slug = 'bamboo-keyboard';
UPDATE public.products SET price = 2828200, image_url = 'https://placehold.co/600x400?text=Keyboard+Ergonomis' WHERE slug = 'ergonomic-keyboard';
UPDATE public.products SET price = 2038200, image_url = 'https://placehold.co/600x400?text=Mikrofon+USB' WHERE slug = 'microphone-usb';
UPDATE public.products SET price = 458200, image_url = 'https://placehold.co/600x400?text=Powerbank' WHERE slug = 'power-bank';
UPDATE public.products SET price = 932200, image_url = 'https://placehold.co/600x400?text=Powerbank+20000' WHERE slug = 'power-bank-20000';
UPDATE public.products SET price = 237000, image_url = 'https://placehold.co/600x400?text=Steker+Pintar' WHERE slug = 'smart-plug';
UPDATE public.products SET price = 616200, image_url = 'https://placehold.co/600x400?text=Stand+Tablet' WHERE slug = 'tablet-stand';
UPDATE public.products SET price = 1248200, image_url = 'https://placehold.co/600x400?text=Ketel+Elektrik' WHERE slug = 'electric-kettle';

-- Office Decor
UPDATE public.products SET price = 9464200, image_url = 'https://placehold.co/600x400?text=Kursi+ErgoLift' WHERE slug = 'ergolift-chair';
UPDATE public.products SET price = 663600, image_url = 'https://placehold.co/600x400?text=Mat+Meja+XL' WHERE slug = 'desk-mat-xl';
UPDATE public.products SET price = 6778200, image_url = 'https://placehold.co/600x400?text=Rangka+Meja+Berdiri' WHERE slug = 'standing-desk-frame';
UPDATE public.products SET price = 2038200, image_url = 'https://placehold.co/600x400?text=Lampu+Meja+Minimalis' WHERE slug = 'minimalist-desk-lamp';
UPDATE public.products SET price = 853200, image_url = 'https://placehold.co/600x400?text=Stand+Monitor+Riser' WHERE slug = 'monitor-stand-riser';
UPDATE public.products SET price = 663600, image_url = 'https://placehold.co/600x400?text=Organizer+Meja' WHERE slug = 'desk-organizer';
UPDATE public.products SET price = 1027000, image_url = 'https://placehold.co/600x400?text=Stand+Papan+Tulis' WHERE slug = 'whiteboard-stand';
UPDATE public.products SET price = 458200, image_url = 'https://placehold.co/600x400?text=Pad+Meja' WHERE slug = 'desk-pad';
UPDATE public.products SET price = 932200, image_url = 'https://placehold.co/600x400?text=Stand+Laptop' WHERE slug = 'laptop-stand';
UPDATE public.products SET price = 1406200, image_url = 'https://placehold.co/600x400?text=Light+Bar+Monitor' WHERE slug = 'monitor-light-bar';

-- Wearables
UPDATE public.products SET price = 7094200, image_url = 'https://placehold.co/600x400?text=Smartwatch+Ultra' WHERE slug = 'smart-watch-ultra';
UPDATE public.products SET price = 774200, image_url = 'https://placehold.co/600x400?text=Band+Pelacak+Kebugaran' WHERE slug = 'fitness-tracker-band';
UPDATE public.products SET price = 1975000, image_url = 'https://placehold.co/600x400?text=Kacamata+Hitam' WHERE slug = 'sunglasses-polarized';

-- Productivity
UPDATE public.products SET price = 600400, image_url = 'https://placehold.co/600x400?text=Planner+Fokus+Pro' WHERE slug = 'focus-planner-pro';
UPDATE public.products SET price = 711000, image_url = 'https://placehold.co/600x400?text=Set+Pena+Emas' WHERE slug = 'pen-set-gold';
UPDATE public.products SET price = 379200, image_url = 'https://placehold.co/600x400?text=Set+Buku+Catatan+A5' WHERE slug = 'notebook-set-a5';
UPDATE public.products SET price = 758400, image_url = 'https://placehold.co/600x400?text=Buku+Kulit' WHERE slug = 'leather-notebook';
UPDATE public.products SET price = 758400, image_url = 'https://placehold.co/600x400?text=Buku+Catatan+Kulit' WHERE slug = 'notebook-leather';
UPDATE public.products SET price = 284400, image_url = 'https://placehold.co/600x400?text=Buku+Catatan+Dot+Grid' WHERE slug = 'notebook-dot-grid';
UPDATE public.products SET price = 189600, image_url = 'https://placehold.co/600x400?text=Buku+Catatan+Saku' WHERE slug = 'pocket-notebook';
UPDATE public.products SET price = 2923000, image_url = 'https://placehold.co/600x400?text=Portofolio+Kulit' WHERE slug = 'leather-portfolio';

-- Apparel
UPDATE public.products SET price = 1501000, image_url = 'https://placehold.co/600x400?text=Sweater+Rajutan+Merino' WHERE slug = 'merino-crew-sweater';
UPDATE public.products SET price = 1027000, image_url = 'https://placehold.co/600x400?text=Dompet+Kartu+Kulit' WHERE slug = 'leather-card-wallet';
UPDATE public.products SET price = 2291000, image_url = 'https://placehold.co/600x400?text=Ransel+Kanvas' WHERE slug = 'canvas-backpack';
UPDATE public.products SET price = 1390400, image_url = 'https://placehold.co/600x400?text=Kemeja+Linen' WHERE slug = 'linen-button-down';
UPDATE public.products SET price = 869000, image_url = 'https://placehold.co/600x400?text=Syal+Campuran+Wol' WHERE slug = 'wool-blend-scarf';
UPDATE public.products SET price = 1027000, image_url = 'https://placehold.co/600x400?text=Kaos+Polo+Klasik' WHERE slug = 'polo-shirt-classic';
UPDATE public.products SET price = 2022400, image_url = 'https://placehold.co/600x400?text=Jaket+Denim' WHERE slug = 'denim-jacket';
UPDATE public.products SET price = 1232400, image_url = 'https://placehold.co/600x400?text=Jogger+Chino' WHERE slug = 'chino-joggers';
UPDATE public.products SET price = 1406200, image_url = 'https://placehold.co/600x400?text=Hoodie+Katun' WHERE slug = 'cotton-hoodie';
UPDATE public.products SET price = 505600, image_url = 'https://placehold.co/600x400?text=Tas+Kanvas' WHERE slug = 'canvas-tote-bag';
UPDATE public.products SET price = 758400, image_url = 'https://placehold.co/600x400?text=Dasi+Sutra' WHERE slug = 'silk-tie';
UPDATE public.products SET price = 553000, image_url = 'https://placehold.co/600x400?text=Kaos+Grafis' WHERE slug = 'graphic-tee';
UPDATE public.products SET price = 916400, image_url = 'https://placehold.co/600x400?text=Celana+Pendek+Chino' WHERE slug = 'chino-shorts';
UPDATE public.products SET price = 853200, image_url = 'https://placehold.co/600x400?text=Kemeja+Slim' WHERE slug = 'dress-shirt-slim';
UPDATE public.products SET price = 1137600, image_url = 'https://placehold.co/600x400?text=Chino+Slim' WHERE slug = 'chinos-slim';
UPDATE public.products SET price = 869000, image_url = 'https://placehold.co/600x400?text=Sabuk+Kulit' WHERE slug = 'leather-belt';
UPDATE public.products SET price = 869000, image_url = 'https://placehold.co/600x400?text=Syal+Wol' WHERE slug = 'wool-scarf';
UPDATE public.products SET price = 505600, image_url = 'https://placehold.co/600x400?text=Beanie+Wol' WHERE slug = 'wool-beanie';
UPDATE public.products SET price = 2607000, image_url = 'https://placehold.co/600x400?text=Kardigan+Wol' WHERE slug = 'wool-cardigan';
UPDATE public.products SET price = 853200, image_url = 'https://placehold.co/600x400?text=Celana+Jogger' WHERE slug = 'jogger-pants';
UPDATE public.products SET price = 1232400, image_url = 'https://placehold.co/600x400?text=Kemeja+Denim' WHERE slug = 'denim-shirt';

-- Wellness
UPDATE public.products SET price = 1011200, image_url = 'https://placehold.co/600x400?text=Set+Seduh+Keramik' WHERE slug = 'ceramic-pour-over-set';
UPDATE public.products SET price = 537200, image_url = 'https://placehold.co/600x400?text=Botol+Air+Isolasi' WHERE slug = 'insulated-water-bottle';
UPDATE public.products SET price = 916400, image_url = 'https://placehold.co/600x400?text=Bantal+Meditasi' WHERE slug = 'meditation-cushion';
UPDATE public.products SET price = 537200, image_url = 'https://placehold.co/600x400?text=Difuser+Minyak+Esensial' WHERE slug = 'essential-oil-diffuser';
UPDATE public.products SET price = 1406200, image_url = 'https://placehold.co/600x400?text=Selimut+Berpemberat' WHERE slug = 'weighted-blanket';
UPDATE public.products SET price = 379200, image_url = 'https://placehold.co/600x400?text=Masker+Tidur' WHERE slug = 'sleep-mask';
UPDATE public.products SET price = 410800, image_url = 'https://placehold.co/600x400?text=Botol+Infuser+Teh' WHERE slug = 'tea-infuser-bottle';
UPDATE public.products SET price = 442400, image_url = 'https://placehold.co/600x400?text=Lilin+Aromaterapi' WHERE slug = 'aromatherapy-candle';
UPDATE public.products SET price = 1232400, image_url = 'https://placehold.co/600x400?text=Bangku+Meditasi' WHERE slug = 'meditation-bench';
UPDATE public.products SET price = 505600, image_url = 'https://placehold.co/600x400?text=Lilin+Wangi' WHERE slug = 'scented-candle';
UPDATE public.products SET price = 1343000, image_url = 'https://placehold.co/600x400?text=Set+Teh' WHERE slug = 'tea-set';

-- Fitness
UPDATE public.products SET price = 5514200, image_url = 'https://placehold.co/600x400?text=Dumbel+Adjustable' WHERE slug = 'adjustable-dumbbells';
UPDATE public.products SET price = 458200, image_url = 'https://placehold.co/600x400?text=Set+Ban+Resistansi' WHERE slug = 'resistance-band-set';
UPDATE public.products SET price = 442400, image_url = 'https://placehold.co/600x400?text=Roller+Busa' WHERE slug = 'foam-roller';
UPDATE public.products SET price = 1074400, image_url = 'https://placehold.co/600x400?text=Mat+Yoga+Premium' WHERE slug = 'yoga-mat-premium';
UPDATE public.products SET price = 458200, image_url = 'https://placehold.co/600x400?text=Ban+Resistansi' WHERE slug = 'resistance-bands';
UPDATE public.products SET price = 347600, image_url = 'https://placehold.co/600x400?text=Lompat+Tali+Speed' WHERE slug = 'jump-rope-speed';
UPDATE public.products SET price = 284400, image_url = 'https://placehold.co/600x400?text=Roller+Pergelangan+Tangan' WHERE slug = 'wrist-roller';
UPDATE public.products SET price = 2038200, image_url = 'https://placehold.co/600x400?text=Sepatu+Lari' WHERE slug = 'running-shoes';
UPDATE public.products SET price = 252800, image_url = 'https://placehold.co/600x400?text=Bola+Pijat' WHERE slug = 'massage-ball';
UPDATE public.products SET price = 711000, image_url = 'https://placehold.co/600x400?text=Palang+Pull+Up' WHERE slug = 'pull-up-bar';
UPDATE public.products SET price = 553000, image_url = 'https://placehold.co/600x400?text=Tabung+Resistansi' WHERE slug = 'resistance-tubes';
UPDATE public.products SET price = 1027000, image_url = 'https://placehold.co/600x400?text=Kettlebell+16kg' WHERE slug = 'kettlebell-16kg';
UPDATE public.products SET price = 347600, image_url = 'https://placehold.co/600x400?text=Lompat+Tali' WHERE slug = 'jump-rope';
UPDATE public.products SET price = 252800, image_url = 'https://placehold.co/600x400?text=Balok+Yoga' WHERE slug = 'yoga-block';
UPDATE public.products SET price = 300200, image_url = 'https://placehold.co/600x400?text=Alat+Latih+Genggaman' WHERE slug = 'grip-trainer';
UPDATE public.products SET price = 711000, image_url = 'https://placehold.co/600x400?text=Celana+Pendek+Lari' WHERE slug = 'running-shorts';
UPDATE public.products SET price = 1027000, image_url = 'https://placehold.co/600x400?text=Tas+Hidrasi' WHERE slug = 'hydration-pack';
UPDATE public.products SET price = 379200, image_url = 'https://placehold.co/600x400?text=Roller+Busa+Lembut' WHERE slug = 'foam-roller-soft';
UPDATE public.products SET price = 347600, image_url = 'https://placehold.co/600x400?text=Roller+Perut' WHERE slug = 'ab-roller';
UPDATE public.products SET price = 1406200, image_url = 'https://placehold.co/600x400?text=Kettlebell+24kg' WHERE slug = 'kettlebell-24kg';
UPDATE public.products SET price = 2354200, image_url = 'https://placehold.co/600x400?text=Sepatu+Lari+Trail' WHERE slug = 'running-shoes-trail';
UPDATE public.products SET price = 316000, image_url = 'https://placehold.co/600x400?text=Roller+Busa+Sedang' WHERE slug = 'foam-roller-medium';
