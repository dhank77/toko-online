import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="w-full py-16 px-6 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <span className="text-lg font-bold text-foreground">ShopComposed</span>
          <p className="text-muted-foreground text-sm">
            Providing curated, high-efficiency shopping solutions for the modern professional since 2024.
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
          <h4 className="font-semibold text-primary">Shopping</h4>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">New Arrivals</a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Top Sellers</a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Flash Sale</a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Gifts</a>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-primary">Support</h4>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Help Center</a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Shipping Info</a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Returns</a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">Contact Us</a>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-primary">Newsletter</h4>
          <p className="text-muted-foreground text-sm">Get early access to drops and exclusive sale invites.</p>
          <div className="flex mt-2">
            <Input
              placeholder="Email address"
              type="email"
              className="rounded-r-none"
            />
            <Button className="rounded-l-none">Join</Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-sm">© 2024 ShopComposed. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">
            Privacy Policy
          </a>
          <a className="text-muted-foreground hover:text-primary transition-all text-sm" href="#">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  )
}
