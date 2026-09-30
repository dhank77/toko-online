// Konfigurasi PM2 untuk hosting cPanel / VPS / server dedicated.
//
// cPanel berjalan sebagai server permanen, jadi Express HARUS dijalankan
// terus-menerus. PM2 menjaga proses tetap hidup (auto-restart bila crash).
//
// Cara pakai:
//   cd ~/toko-online/server
//   pm2 start ecosystem.config.cjs
//   pm2 save
//   pm2 startup     (agar auto-start setelah server reboot)
//
// Cek status:  pm2 status
// Lihat log:   pm2 logs toko-api
// Restart:     pm2 restart toko-api

module.exports = {
  apps: [
    {
      name: 'toko-api',
      script: 'src/index.js',
      // PORT harus diisi sesuai "Application root" yang Anda pakai di cPanel.
      // Jangan pakai port yang sama dengan Apache (80/443).
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Auto-restart bila proses crash. Jangan pakai watch:true di produksi
      // agar PM2 tidak melakukan restart setiap ada perubahan berkas.
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      time: true,
    },
  ],
}
