const footerColumns = [
  {
    title: 'ShopComposed',
    links: ['Tentang Kami', 'Karier', 'Blog', 'Media Kit'],
  },
  {
    title: 'Belanja',
    links: ['Flash Sale', 'Kategori Pilihan', 'Produk Terbaru', 'Rekomendasi Untukmu'],
  },
  {
    title: 'Bantuan',
    links: ['Pusat Bantuan', 'Cara Belanja', 'Pengiriman', 'Pengembalian Dana', 'Hubungi Kami'],
  },
]

const paymentMethods = ['BCA', 'Mandiri', 'BNI', 'BRI', 'GoPay', 'OVO', 'DANA', 'QRIS']
const couriers = ['JNE', 'J&T Express', 'SiCepat', 'AnterAja', 'GoSend', 'Instant']

function LinkColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-semibold text-foreground">{title}</h4>
      {links.map((link) => (
        <a key={link} className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">
          {link}
        </a>
      ))}
    </div>
  )
}

function ChipGroup({ title, items }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="text-xs font-medium border border-border rounded-md px-2 py-1 bg-background text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {footerColumns.map((col) => (
          <LinkColumn key={col.title} title={col.title} links={col.links} />
        ))}

        <div className="flex flex-col gap-8">
          <ChipGroup title="Pembayaran" items={paymentMethods} />
          <ChipGroup title="Pengiriman" items={couriers} />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Ikuti Kami</h4>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform">
                public
              </span>
              <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform">
                alternate_email
              </span>
              <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform">
                play_circle
              </span>
              <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform">
                chat
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Download App</h4>
            <p className="text-muted-foreground text-sm">
              Belanja lebih mudah lewat aplikasi ShopComposed di ponsel Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} ShopComposed. Hak cipta dilindungi.</p>
        <div className="flex gap-4">
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">
            Kebijakan Privasi
          </a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">
            Syarat & Ketentuan
          </a>
        </div>
      </div>
    </footer>
  )
}
