export default function TrendingProducts() {
  const products = [
    {
      id: 1,
      name: 'Pro-Series Keyboard',
      price: '$189.00',
      rating: 4.5,
      reviews: 124,
      badge: 'Top Rated',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuArf2L9PePb0IWOij45UZzSdbbis8Tj7M5xeT5bBjNnb31yV_FK1_uOz7SezA_WV2oh0oHuV75BdB3_vlUzZ4iNQgWi7kC3Ty8h02gzzgorS90LgNhxnUBLLqL1xEt3FGqQaOXI1-Mogueej-6FJBGjJm01MMebVR9sDcEi7y2geMgtBIUIFejE6kDXqJxCRqbbbfq_0gZ1jb4xikMQCatiFwe-YpD7_KdRC3NC128ITBUWqwGiE2ZtoA',
    },
    {
      id: 2,
      name: 'Executive Portfolio',
      price: '$245.00',
      rating: 4,
      reviews: 86,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDbPlRv0t7a6nWGaZrFEzksC6FuGCldUSU7LA8yaWtkzoaKVlB-n0-z5dFq97_Ao_sExKVxEZTj-xmmVYWu1VIMwicDtN71USeero-ll31FrK_GEQ4wgALbnLifDaROQg5s22gomR-EDZHkE5ERMkKcoLGURYZ5jIzwPxUVREefVKIKl_UxC1g9LSQIwJo4_w0XnDROlyjEjzyPkDVnM8S4QpsHzDpT6RZZ20cbkmiQK0nNx0186QhP7g',
    },
    {
      id: 3,
      name: 'Zenith Headphones',
      price: '$320.00',
      rating: 5,
      reviews: 210,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAV4A9Wi0gT8CpUgh8xU8cq3iAGJGuxtAEzv0hz0HilIO1XsbfWKonCLijj2tedtBzQz2-0FwSXRdeB7dpbseR3UDvWUYcEVs6MK_VsdeZ3kYfGlHyAVHbgKBO3Y7dVUsT0m1WOnTOZZdxddNfI_rcuQdjOipnMj3ERUh7AANqw-Xqre0V2ObdfdOyEUfEWi5opK7h6XxU11CYeb06Miqzb2BXb2vopnudKCFZ25hLJvoAgL2VzQkWcPA',
    },
    {
      id: 4,
      name: 'AquaSmart Flask',
      price: '$55.00',
      rating: 4.5,
      reviews: 54,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAQqa1XmxdGXs34FjocJXX95wKQJo23QC0X6_-JiLlnjFYoxwkouos4vS7qe6bAe3nqIUmMclrRf2_cwrJaO47d06jOqIiNpiCT6oGZCeWyvb_lrzHGhUx37KJrfy4_IebMcj1AF8v2-jJjs29wkPmsp7yiNKiV2dOJ_mfE9VkZcwEbVE9pDJ5PGAWMEo9PIeqAmqz7QETFookE78JEvWpiJGOzrfQDz7uNrXNeYd-tDO2jpwaUzZuY8w',
    },
  ]

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        )
      } else if (i - 0.5 === rating) {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            star_half
          </span>
        )
      } else {
        stars.push(
          <span key={i} className="material-symbols-outlined text-sm">
            star
          </span>
        )
      }
    }
    return stars
  }

  return (
    <section className="py-lg bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Trending Now</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">
              Selected by our community of professional shoppers.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface transition-all">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface transition-all">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {products.map((product) => (
            <div key={product.id} className="bg-surface rounded-2xl overflow-hidden ambient-card group cursor-pointer hover:elevated-card transition-all">
              <div className="relative h-64 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  data-alt={`Product image for ${product.name}`}
                  src={product.image}
                />
                <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
                {product.badge && (
                  <span className="absolute bottom-4 left-4 bg-secondary-fixed text-on-secondary-fixed text-label-sm px-2 py-1 rounded">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-md text-body-lg font-bold text-on-surface">{product.name}</h3>
                  <span className="font-bold text-primary">{product.price}</span>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  <div className="flex text-secondary">{renderStars(product.rating)}</div>
                  <span className="text-label-sm text-on-surface-variant">({product.reviews} reviews)</span>
                </div>
                <button className="w-full border border-primary text-primary py-2 rounded-xl font-label-md hover:bg-primary hover:text-on-primary transition-all">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
