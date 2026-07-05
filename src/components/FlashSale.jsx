export default function FlashSale() {
  return (
    <section className="py-xl">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="bg-tertiary-container dark:bg-tertiary rounded-[32px] p-lg flex flex-col md:flex-row items-center gap-xl relative overflow-hidden">
          <div className="relative z-10 flex-1">
            <span className="text-secondary-fixed font-label-md mb-4 block">Limited Time Offer</span>
            <h2 className="text-on-tertiary font-display-lg text-display-lg mb-6">Flash Sale Event</h2>
            <p className="text-on-tertiary-container font-body-lg mb-8 max-w-md">
              Save up to 40% on workspace essentials. Once the clock hits zero, the deals are gone forever.
            </p>
            <div className="flex gap-md mb-8">
              <div className="flex flex-col items-center bg-surface-container-highest/20 backdrop-blur-md rounded-2xl w-24 py-4">
                <span className="text-on-tertiary text-headline-lg font-bold" id="hours">
                  12
                </span>
                <span className="text-on-tertiary-container text-label-sm">Hours</span>
              </div>
              <div className="flex flex-col items-center bg-surface-container-highest/20 backdrop-blur-md rounded-2xl w-24 py-4">
                <span className="text-on-tertiary text-headline-lg font-bold" id="minutes">
                  45
                </span>
                <span className="text-on-tertiary-container text-label-sm">Mins</span>
              </div>
              <div className="flex flex-col items-center bg-surface-container-highest/20 backdrop-blur-md rounded-2xl w-24 py-4">
                <span className="text-on-tertiary text-headline-lg font-bold" id="seconds">
                  08
                </span>
                <span className="text-on-tertiary-container text-label-sm">Secs</span>
              </div>
            </div>
            <button className="bg-secondary text-on-secondary px-10 py-4 rounded-xl font-bold hover:brightness-110 transition-all">
              Explore Sale Items
            </button>
          </div>
          <div className="relative z-10 w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-2xl">
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
