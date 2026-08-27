import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function FlashSale() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-muted rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <div className="relative z-10 flex-1">
            <Badge variant="secondary" className="mb-4">Limited Time Offer</Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6">Flash Sale Event</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Save up to 40% on workspace essentials. Once the clock hits zero, the deals are gone forever.
            </p>
            <div className="flex gap-4 mb-8">
              <div className="flex flex-col items-center bg-background/20 backdrop-blur-md rounded-2xl w-24 py-4">
                <span className="text-2xl font-bold text-foreground" id="hours">12</span>
                <span className="text-sm text-muted-foreground">Hours</span>
              </div>
              <div className="flex flex-col items-center bg-background/20 backdrop-blur-md rounded-2xl w-24 py-4">
                <span className="text-2xl font-bold text-foreground" id="minutes">45</span>
                <span className="text-sm text-muted-foreground">Mins</span>
              </div>
              <div className="flex flex-col items-center bg-background/20 backdrop-blur-md rounded-2xl w-24 py-4">
                <span className="text-2xl font-bold text-foreground" id="seconds">08</span>
                <span className="text-sm text-muted-foreground">Secs</span>
              </div>
            </div>
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Explore Sale Items
            </Button>
          </div>
          <div className="relative z-10 w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden">
            <img
              className="w-full h-full object-cover"
              data-alt="A sophisticated collection of dark professional tech gear including a camera, high-end smartwatch, and sleek minimalist tools arranged on a dark charcoal textured surface. Dramatic lighting with teal highlights creates a mood of exclusivity and urgency."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7Hna9rs8uQJdRN0mZWvBA6nHoaH0SdTte-SyeiFdX7aakkzjhTTF6hZeIAzVD6NvUXdgCkuwlrJmuWaZvN9CBJgrY6MPiY5lr0conYMlY1HtcF2vW_422dnFeJsEkWXdZDbC8MarGdTAZ-MSX1xtVe1n2RX-gH-uaR6KXtL3buOWMOKk_uTYpApfBsrC9QS-Q0BnU6zpa5VXc3loTdYyO7C99K8FtdkX6PCeToX9_sPEU1xNlAC257A"
            />
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  )
}
