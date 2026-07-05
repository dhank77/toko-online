export default function CategorySection() {
  const categories = [
    { icon: 'laptop_mac', label: 'Tech Gear' },
    { icon: 'chair', label: 'Office Decor' },
    { icon: 'watch', label: 'Wearables' },
    { icon: 'auto_stories', label: 'Productivity' },
    { icon: 'checkroom', label: 'Apparel' },
    { icon: 'coffee', label: 'Wellness' },
    { icon: 'fitness_center', label: 'Fitness' },
  ]

  return (
    <section className="py-md overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter mb-sm flex justify-between items-end">
        <h2 className="font-headline-lg text-headline-lg text-primary">Browse Categories</h2>
        <a className="text-secondary font-label-md text-label-md hover:underline flex items-center gap-1" href="#">
          View All <span className="material-symbols-outlined text-sm">chevron_right</span>
        </a>
      </div>
      <div className="flex gap-md overflow-x-auto no-scrollbar px-gutter pb-4">
        {categories.map((cat) => (
          <div key={cat.icon} className="flex-shrink-0 w-32 flex flex-col items-center gap-sm group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-transparent group-hover:border-secondary transition-all flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface">{cat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
