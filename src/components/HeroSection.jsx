import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HeroSection() {
  return (
    <section className="px-6 py-8 max-w-7xl mx-auto">
      <div className="relative h-[500px] rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-foreground/80 via-foreground/30 to-transparent"></div>
        <img
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          data-alt="High-end premium lifestyle product arrangement featuring sleek electronics and minimalist home decor in a bright, modern architectural space. The image is bathed in soft professional lighting with professional blue and teal color accents, emphasizing efficiency and luxury."
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAO-hieItXxTEtuWTIPMA8h8av4IltYbz5HFBHERs2F53LOCmrq4Z7IAKI4413da786Y5uPioQzZDyvMyCfm2GhlRYlqchbaBva5VVAPO8X5jFbVNMthoGqsW2hvofVBi8C0KKre7jmoObbArFdU4VAomycFZefa-qlvIcyi03MmDUy3VGsQq2OWL-pUc4XmzXlBVeZpHrbugcXmgf-bN4xT7DtzALxRogHVjV9ItDSmGbHZ0hwmuJo6Q"
        />
        <div className="relative z-20 h-full flex flex-col justify-center px-10 max-w-2xl">
          <Badge variant="secondary" className="w-fit mb-4">
            Limited Season Drop
          </Badge>
          <h1 className="text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Elevate Your Everyday Essentials
          </h1>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Experience the intersection of corporate efficiency and premium retail. curated selections for the
            discerning professional.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Shop Collections <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
            <Button variant="outline" size="lg" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
              View Lookbook
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
