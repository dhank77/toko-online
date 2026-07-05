export default function NewArrivals() {
  const items = [
    {
      title: 'Sustainable Workspace',
      desc: 'Eco-friendly materials for the modern home office.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCyXpo1oh8BooXAWDFn_hvlBEFBf4lFifwKfFIKRXzXgFse6T4UCOChehPpCmp5mit7RdcDoveZbNhfte4QugqhuHpRJyBZHQTwSa4G0rbkL7yE7reTjJvBH7210TidCbmowt6cukDisCQp6muatlsaDj0l6HhbbHi1ma4WcX3kP8XhVJCmZfEubPwT0s_oxaCLCA-CQQf3dOgOapWRcioWj8eWcA8IE2ePJbTK0dNalur_B4W5p0nsA',
      btn: 'Shop Now',
      mdClass: 'md:col-span-2 md:row-span-2',
    },
    {
      title: 'Audio Elite',
      desc: null,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZXYMewpkBoen-lTZLQKo3Hu-sE3TBgdyX4ODk_T3Jr7I8WCggX4cY411Y0MVzRjVnrenfvgugumkPVjFj1f8qiapcEA_Qaum9euY4mGt05HEP7lro7fSBPRRsNbhuz26PCW0qFzHHFZ1-8yJCitYUL3xS4opGRP-KHSWQ8GDaLcwHcWkoLGyx9wGG1z3_5MCvEJhhVEvoOHpYaZ-ekEMLGsWixoMhNnN9-IfY8xEJS-VX4_AzMeJCfA',
      btn: null,
      mdClass: '',
    },
    {
      title: 'Timepieces',
      desc: null,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaYz8Z24lgW4NTOjhgnJ0jn3J5zLiP5Vi9CWr5Xqsk_3_UOjJSenWy_TeP1oCyQ9ofP071bff35GXnfOT-hDuEiw4Jg4eX5BoEIWBzPbMkCfGQvGxI-fUvpJQplrE3wDjUzSGeuM6SEJAfcftenwhS4sdG8FsI1rTOxNuEbLyVjHywlHW89ZpGILYlZo4ulyLfiCp3h4idJJhv7n7KxgoqcT0yoWh03F49VAHg2iAKJjQMq4zslOxpVQ',
      btn: null,
      mdClass: '',
    },
    {
      title: 'Travel Essentials',
      desc: null,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXB6eT2r-9TR05J3DDhPfm8BbWObnr_jmQB-B4ECX8wLaKmsiwYg1O63WOqmvgDuU9JQJzpWVyHwNSwm2JCnkaar8OTrDc3OrFwcetTAMTpteDxOZ3VmO0ab-G15yw2jY8l17AXunIvu8V56z38eGV1mHupw2cqoju0mwTsDFUvhd-4JreBU_plrk3iK8XgP03zLJbW90bHtV24gm04EzbzLxk-5emH-G3xRFDfDBo2PI9O4yCsHR6aA',
      btn: null,
      mdClass: 'md:col-span-2',
    },
  ]

  return (
    <section className="py-lg max-w-container-max mx-auto px-gutter">
      <h2 className="font-headline-lg text-headline-lg text-primary mb-lg text-center">New Arrivals</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-sm h-[600px]">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-3xl overflow-hidden relative group ${item.mdClass ? item.mdClass : ''} ambient-card`}>
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              data-alt={`${item.title} product image`}
              src={item.img}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors p-md flex items-end">
              {item.desc ? (
                <div className="flex flex-col">
                  <span className="text-white font-headline-lg font-bold mb-2">{item.title}</span>
                  <p className="text-white/80 font-body-md mb-4">{item.desc}</p>
                  <button className="bg-white text-primary px-6 py-2 rounded-lg font-label-md w-fit">
                    {item.btn}
                  </button>
                </div>
              ) : (
                <span className="text-white font-bold">{item.title}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
