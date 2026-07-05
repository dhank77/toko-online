export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest dark:bg-surface-container-highest border-t border-outline-variant">
      <div className="w-full py-xl px-gutter grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container-max mx-auto">
        <div className="flex flex-col gap-sm">
          <span className="text-label-md font-label-md font-bold text-on-surface">ShopComposed</span>
          <p className="text-on-surface-variant font-body-sm text-body-sm">
            Providing curated, high-efficiency shopping solutions for the modern professional since 2024.
          </p>
          <div className="flex gap-md mt-4">
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
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-primary">Shopping</h4>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">New Arrivals</a>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">Top Sellers</a>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">Flash Sale</a>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">Gifts</a>
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-primary">Support</h4>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">Help Center</a>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">Shipping Info</a>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">Returns</a>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">Contact Us</a>
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-primary">Newsletter</h4>
          <p className="text-on-surface-variant font-body-sm">Get early access to drops and exclusive sale invites.</p>
          <div className="flex mt-2">
            <input
              className="bg-surface border border-outline-variant rounded-l-lg px-4 py-2 w-full focus:outline-none focus:border-primary"
              placeholder="Email address"
              type="email"
            />
            <button className="bg-primary text-on-primary px-4 py-2 rounded-r-lg">Join</button>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-gutter py-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
        <p className="text-on-surface-variant font-body-sm">© 2024 ShopComposed. All rights reserved.</p>
        <div className="flex gap-md">
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">
            Privacy Policy
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-all font-body-sm" href="#">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  )
}
