# Panduan Lengkap Integrasi Midtrans dengan React (Vite), Express.js, dan Supabase

Dokumentasi ini menyediakan panduan komprehensif untuk mengintegrasikan **Midtrans Payment Gateway** ke dalam aplikasi full-stack Anda yang menggunakan:
- **Frontend**: React (Vite)
- **Backend**: Express.js (Node.js)
- **Database**: Supabase (PostgreSQL)

---

## 1. Persiapan Akun & Kredensial Midtrans

Sebelum memulai coding, pastikan Anda telah memiliki akun Midtrans (Sandbox/Production):
1. Daftar atau masuk ke [Midtrans Dashboard](https://dashboard.midtrans.com/).
2. Masuk ke menu **Settings > Access Keys** untuk mendapatkan:
   - **Merchant ID**
   - **Client Key** (digunakan di Frontend)
   - **Server Key** (digunakan di Backend - *rahasia!*)
3. Pastikan mode diatur ke **Sandbox** untuk tahap pengembangan (Development).

---

## 2. Struktur Database Supabase

Buat tabel `transactions` di Supabase SQL Editor untuk mencatat status pembayaran pengguna:

```sql
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  order_id varchar(255) not null unique,
  user_id uuid references auth.users(id),
  gross_amount numeric(12, 2) not null,
  status varchar(50) default 'pending' not null,
  payment_type varchar(50),
  transaction_time timestamp with time zone,
  raw_response jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) jika diperlukan
alter table public.transactions enable row level security;
```

---

## 3. Implementasi Backend (Express.js)

### 3.1. Instalasi Dependencies
Masuk ke direktori backend Anda dan install `midtrans-client`, `express`, `cors`, `dotenv`, dan `@supabase/supabase-js`.

```bash
npm install express cors dotenv midtrans-client @supabase/supabase-js
```

### 3.2. Konfigurasi `.env` (Backend)
```env
PORT=5000
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY
MIDTRANS_IS_PRODUCTION=false
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3.3. Kode Express Server (`server.js`)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Inisialisasi Supabase Client (menggunakan service role key untuk akses server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Inisialisasi Midtrans Snap API
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// 1. Endpoint untuk Membuat Transaksi / Mendapatkan Snap Token
app.post('/api/payment/create-transaction', async (req, res) => {
  try {
    const { userId, items, customerDetails } = req.body;
    
    // Buat order_id unik
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Hitung total gross amount
    const grossAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      item_details: items,
      customer_details: {
        first_name: customerDetails.firstName,
        email: customerDetails.email,
        phone: customerDetails.phone
      }
    };

    // Minta Snap Token ke Midtrans
    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    // Simpan status transaksi 'pending' ke Supabase
    const { error: dbError } = await supabase
      .from('transactions')
      .insert([
        {
          order_id: orderId,
          user_id: userId || null,
          gross_amount: grossAmount,
          status: 'pending'
        }
      ]);

    if (dbError) {
      console.error('Supabase Error:', dbError);
    }

    res.status(200).json({
      success: true,
      token: snapToken,
      order_id: orderId
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Endpoint Webhook / Notification Handler dari Midtrans
app.post('/api/payment/notification', async (req, res) => {
  try {
    const notificationJson = req.body;

    // Verifikasi notifikasi menggunakan Midtrans Core API Client
    const apiClient = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    const statusResponse = await apiClient.transaction.status(notificationJson.order_id);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    let newStatus = 'pending';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        newStatus = 'challenge';
      } else if (fraudStatus == 'accept') {
        newStatus = 'success';
      }
    } else if (transactionStatus == 'settlement') {
      newStatus = 'success';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      newStatus = 'failed';
    } else if (transactionStatus == 'pending') {
      newStatus = 'pending';
    }

    // Update status transaksi di Supabase
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: newStatus,
        payment_type: paymentType,
        transaction_time: statusResponse.transaction_time,
        raw_response: statusResponse
      })
      .eq('order_id', orderId);

    if (updateError) {
      console.error('Failed to update Supabase transaction:', updateError);
      return res.status(500).json({ message: 'Database update error' });
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Error handling notification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 4. Implementasi Frontend (React + Vite)

### 4.1. Masukkan Script Midtrans Snap di `index.html`
Buka file `index.html` pada root proyek Vite Anda dan tambahkan script Snap Midtrans di dalam tag `<head>`:

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aplikasi Saya</title>
    <!-- Midtrans Snap Sandbox Script (Ganti ke URL production jika live) -->
    <script 
      type="text/javascript" 
      src="https://app.sandbox.midtrans.com/snap/snap.js" 
      data-client-key="SB-Mid-client-YOUR_CLIENT_KEY">
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 4.2. Komponen Checkout React (`Checkout.jsx`)

Buat komponen untuk memicu pembayaran:

```jsx
import React, { useState } from 'react';

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Data dummy keranjang belanja
      const payload = {
        userId: "uuid-user-supabase-anda", // Opsional, sesuaikan dengan auth user
        items: [
          {
            id: "ITEM01",
            price: 100000,
            quantity: 1,
            name: "Produk Contoh Midtrans"
          }
        ],
        customerDetails: {
          firstName: "Budi",
          email: "budi@example.com",
          phone: "081234567890"
        }
      };

      // Request Snap Token ke Express Backend
      const response = await fetch('http://localhost:5000/api/payment/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Gagal membuat transaksi');
      }

      // Panggil Midtrans Snap Popup menggunakan window.snap
      window.snap.pay(data.token, {
        onSuccess: function(result) {
          alert("Pembayaran berhasil!");
          console.log(result);
        },
        onPending: function(result) {
          alert("Menunggu pembayaran Anda!");
          console.log(result);
        },
        onError: function(result) {
          alert("Pembayaran gagal!");
          console.log(result);
        },
        onClose: function() {
          alert('Anda menutup popup pembayaran tanpa menyelesaikan transaksi');
        }
      });

    } catch (err) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Halaman Checkout</h2>
      <p>Produk: Produk Contoh Midtrans - Rp 100.000</p>
      <button 
        onClick={handleCheckout} 
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        {loading ? 'Memproses...' : 'Bayar Sekarang'}
      </button>
    </div>
  );
}
```

---

## 5. Alur Pengujian (Testing di Sandbox)

1. **Jalankan Backend**: 
   ```bash
   node server.js
   ```
2. **Jalankan Frontend Vite**: 
   ```bash
   npm run dev
   ```
3. Klik tombol **Bayar Sekarang** di aplikasi React Anda.
4. Jendela pop-up Midtrans Snap akan muncul. Pilih metode pembayaran (misalnya **Virtual Account - BCA** atau **GoPay**).
5. Ikuti instruksi simulasi pembayaran sandbox dari Midtrans.
6. Periksa tabel `transactions` di **Supabase Dashboard**, status akan otomatis berubah setelah webhook diterima oleh backend Express Anda.

---
*Dokumentasi ini dibuat khusus untuk integrasi React (Vite) + Express + Supabase + Midtrans.*
