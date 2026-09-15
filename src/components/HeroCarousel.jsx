import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '../lib/utils'
import { api } from '../utils/api'

const fallbackSlides = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO-hieItXxTEtuWTIPMA8h8av4IltYbz5HFBHERs2F53LOCmrq4Z7IAKI4413da786Y5uPioQzZDyvMyCfm2GhlRYlqchbaBva5VVAPO8X5jFbVNMthoGqsW2hvofVBi8C0KKre7jmoObbArFdU4VAomycFZefa-qlvIcyi03MmDUy3VGsQq2OWL-pUc4XmzXlBVeZpHrbugcXmgf-bN4xT7DtzALxRogHVjV9ItDSmGbHZ0hwmuJo6Q',
    badge: 'Rilis Musiman Terbatas',
    title: 'Tingkatkan Kebutuhan Sehari-hari Anda',
    desc: 'Rasakan pertemuan antara efisiensi korporat dan ritel premium. Pilihan kurasi untuk profesional yang berwawasan.',
    cta: { label: 'Jelajahi Kategori', href: '#kategori' },
    secondaryCta: { label: 'Lihat Flash Sale', href: '#flash-sale' },
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Hna9rs8uQJdRN0mZWvBA6nHoaH0SdTte-SyeiFdX7aakkzjhTTF6hZeIAzVD6NvUXdgCkuwlrJmuWaZvN9CBJgrY6MPiY5lr0conYMlY1HtcF2vW_422dnFeJsEkWXdZDbC8MarGdTAZ-MSX1xtVe1n2RX-gH-uaR6KXtL3buOWMOKk_uTYpApfBsrC9QS-Q0BnU6zpa5VXc3loTdYyO7C99K8FtdkX6PCeToX9_sPEU1xNlAC257A',
    badge: 'Flash Sale Hari Ini',
    title: 'Diskon Hingga 50% Sebelum Tengah Malam',
    desc: 'Hemat besar untuk kebutuhan workspace dan gadget pilihan. Stok terbatas, jangan sampai kehabisan.',
    cta: { label: 'Lihat Flash Sale', href: '#flash-sale' },
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZXYMewpkBoen-lTZLQKo3Hu-sE3TBgdyX4ODk_T3Jr7I8WCggX4cY411Y0MVzRjVnrenfvgugumkPVjFj1f8qiapcEA_Qaum9euY4mGt05HEP7lro7fSBPRRsNbhuz26PCW0qFzHHFZ1-8yJCitYUL3xS4opGRP-KHSWQ8GDaLcwHcWkoLGyx9wGG1z3_5MCvEJhhVEvoOHpYaZ-ekEMLGsWixoMhNnN9-IfY8xEJS-VX4_AzMeJCfA',
    badge: 'Baru di Tokorakyat.id',
    title: 'Koleksi Terbaru Baru Saja Tiba',
    desc: 'Temukan produk paling baru dari brand favorit, dikirim cepat dengan garansi resmi.',
    cta: { label: 'Belanja Sekarang', href: '#baru' },
  },
]

export default function HeroCarousel() {
  const [slides, setSlides] = useState(fallbackSlides)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await api.getHeroSlides()
        if (data && data.length > 0) {
          const mapped = data.map((s) => ({
            img: s.img,
            badge: s.badge,
            title: s.title,
            desc: s.description,
            cta: s.cta_label ? { label: s.cta_label, href: s.cta_href || '#' } : null,
            secondaryCta: s.secondary_cta_label
              ? { label: s.secondary_cta_label, href: s.secondary_cta_href || '#' }
              : null,
          }))
          setSlides(mapped)
        }
      } catch (err) {
        // Silently fallback to hardcoded slides
        console.warn('Gagal mengambil hero slides:', err.message)
      }
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [paused, slides.length])

  const go = (dir) => setIndex((i) => (i + dir + slides.length) % slides.length)

  return (
    <section className="max-w-7xl mx-auto px-6 pt-6 md:pt-8">
      <div
        className="relative h-[320px] md:h-[440px] rounded-3xl overflow-hidden group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.title}
            aria-hidden={idx !== index}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              idx === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            )}
          >
            <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/30 to-transparent" />
            <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-12 max-w-2xl">
              {slide.badge && (
                <Badge variant="secondary" className="w-fit mb-4">
                  {slide.badge}
                </Badge>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight">
                {slide.title}
              </h1>
              {slide.desc && (
                <p className="text-base md:text-lg text-primary-foreground/90 mb-6 md:mb-8">{slide.desc}</p>
              )}
              <div className="flex gap-4">
                {slide.cta && (
                  <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <a href={slide.cta.href}>{slide.cta.label}</a>
                  </Button>
                )}
                {slide.secondaryCta && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <a href={slide.secondaryCta.href}>{slide.secondaryCta.label}</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="icon"
          aria-label="Slide sebelumnya"
          onClick={() => go(-1)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-background/30 border-transparent text-primary-foreground backdrop-blur hover:bg-background/50 hover:text-primary-foreground"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Slide berikutnya"
          onClick={() => go(1)}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-background/30 border-transparent text-primary-foreground backdrop-blur hover:bg-background/50 hover:text-primary-foreground"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Pindah ke slide ${idx + 1}`}
              onClick={() => setIndex(idx)}
              className={cn(
                'h-2 rounded-full transition-all',
                idx === index ? 'w-6 bg-primary-foreground' : 'w-2 bg-primary-foreground/50 hover:bg-primary-foreground/80'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
