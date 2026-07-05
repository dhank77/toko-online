export default function HeroSection() {
  return (
    <section className="px-gutter py-md max-w-container-max mx-auto">
      <div className="relative h-[500px] rounded-3xl overflow-hidden elevated-card group">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-on-background/80 via-on-background/30 to-transparent"></div>
        <img
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          data-alt="High-end premium lifestyle product arrangement featuring sleek electronics and minimalist home decor in a bright, modern architectural space. The image is bathed in soft professional lighting with professional blue and teal color accents, emphasizing efficiency and luxury."
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAO-hieItXxTEtuWTIPMA8h8av4IltYbz5HFBHERs2F53LOCmrq4Z7IAKI4413da786Y5uPioQzZDyvMyCfm2GhlRYlqchbaBva5VVAPO8X5jFbVNMthoGqsW2hvofVBi8C0KKre7jmoObbArFdU4VAomycFZefa-qlvIcyi03MmDUy3VGsQq2OWL-pUc4XmzXlBVeZpHrbugcXmgf-bN4xT7DtzALxRogHVjV9ItDSmGbHZ0hwmuJo6Q"
        />
        <div className="relative z-20 h-full flex flex-col justify-center px-lg max-w-2xl">
          <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-label-sm font-label-sm w-fit mb-4">
            Limited Season Drop
          </span>
          <h1 className="text-on-primary font-display-lg text-display-lg mb-6 leading-tight">
            Elevate Your Everyday Essentials
          </h1>
          <p className="text-primary-fixed font-body-lg text-body-lg mb-8 opacity-90">
            Experience the intersection of corporate efficiency and premium retail. curated selections for the
            discerning professional.
          </p>
          <div className="flex gap-md">
            <button className="bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-xl font-label-md text-label-md hover:brightness-90 transition-all flex items-center gap-2">
              Shop Collections <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="border border-on-primary text-on-primary px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-on-primary/10 transition-all">
              View Lookbook
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
