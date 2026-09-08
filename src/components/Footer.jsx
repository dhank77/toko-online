import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="w-full py-16 px-6 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
           <span className="text-lg font-bold text-foreground">ShopComposed</span>
           <p className="text-muted-foreground text-sm">
             Menyediakan solusi belanja kurasi dan efisiensi tinggi untuk profesional modern sejak 2024.
           </p>
          <div className="flex gap-4 mt-4">
            <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform">
              public
            </span>
            <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform">
              alternate_email
            </span>
            <span className="material-symbols-outlined text-primary cursor-pointer hover:scale-110 transition-transform">
              share
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
           <h4 className="font-semibold text-primary">Belanja</h4>
           <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Produk Terbaru</a>
           <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Paling Laris</a>
           <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Flash Sale</a>
           <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Hadiah</a>
        </div>
        <div className="flex flex-col gap-4">
           <h4 className="font-semibold text-primary">Bantuan</h4>
           <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Pusat Bantuan</a>
           <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Info Pengiriman</a>
           <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Pengembalian</a>
           <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Hubungi Kami</a>
        </div>
        <div className="flex flex-col gap-4">
           <h4 className="font-semibold text-primary">Buletin</h4>
           <p className="text-muted-foreground text-sm">Dapatkan akses awal ke rilis baru dan undangan eksklusif diskon.</p>
          <div className="flex mt-2">
            <Input
               placeholder="Alamat email"
              type="email"
              className="rounded-r-none"
            />
            <Button className="rounded-l-none">             Gabung</Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
         <p className="text-muted-foreground text-sm">© 2024 ShopComposed. Hak cipta dilindungi.</p>
        <div className="flex gap-4">
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">
             Kebijakan Privasi
          </a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">
             Syarat Layanan
          </a>
        </div>
      </div>
    </footer>
  )
}
