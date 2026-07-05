export default function TopNavBar({ cartCount = 0 }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header bg-surface shadow-sm h-20 flex items-center">
      <nav className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-20">
        <div className="flex items-center gap-lg">
          <span className="text-headline-md font-headline-md font-bold text-primary dark:text-inverse-primary cursor-pointer">
            ShopComposed
          </span>
          <div className="hidden md:flex items-center gap-md">
            <a className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md" href="#">Home</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-body-md text-body-md" href="#">Categories</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-body-md text-body-md" href="#">Help Center</a>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-lg hidden lg:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="w-full bg-surface-container border border-outline-variant rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-body-md"
              placeholder="Search for 'Sustainable Home Decor'..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-sm">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-transform active:scale-90 flex flex-col items-center">
            <span className="material-symbols-outlined">location_on</span>
            <span className="text-label-sm font-label-sm hidden sm:block">Location</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-transform active:scale-90 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="flex items-center gap-xs bg-primary text-on-primary px-4 py-2 rounded-xl scale-95 active:scale-90 transition-transform">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md text-label-md">Cart ({cartCount})</span>
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden cursor-pointer">
            <img
              className="w-full h-full object-cover"
              data-alt="Professional studio portrait of a customer, soft lighting, clean corporate minimalism aesthetic, high resolution photography with neutral background"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDusBWrLYqyMiuF7t7Qa5oZqitatwxcJ8ntPX4-YXAOljBWxT4Iltuvzqv6zV_UsFpKB3Z21ZIRq3ef8YBOsIJbQMku6zpwSUKsL_ErD8B8giowEFtv21QfuXnvGq1GqHfldy3jbSrtFveWltVjhmkH5JI04nJy5rjDRaSf2YpbEBCwrYtKiBMSCNdnOrues7K1r6CiSao3EObqQ4KnH1BKDTdyiGPpo_ouNIRINdHpDe2WMMmgCg4EcA"
            />
          </div>
        </div>
      </nav>
    </header>
  )
}
