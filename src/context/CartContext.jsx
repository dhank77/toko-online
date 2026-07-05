import { useState, createContext, useContext, useMemo } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Pro-Series Keyboard',
      price: '$189.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuArf2L9PePb0IWOij45UZzSdbbis8Tj7M5xeT5bBjNnb31yV_FK1_uOz7SezA_WV2oh0oHuV75BdB3_vlUzZ4iNQgWi7kC3Ty8h02gzzgorS90LgNhxnUBLLqL1xEt3FGqQaOXI1-Mogueej-6FJBGjJm01MMebVR9sDcEi7y2geMgtBIUIFejE6kDXqJxCRqbbbfq_0gZ1jb4xikMQCatiFwe-YpD7_KdRC3NC128ITBUWqwGiE2ZtoA',
      variant: 'Midnight Black • Wireless • Tactile Switches',
      quantity: 1,
      selected: true,
    },
    {
      id: 2,
      name: 'Executive Portfolio',
      price: '$245.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDbPlRv0t7a6nWGaZrFEzksC6FuGCldUSU7LA8yaWtkzoaKVlB-n0-z5dFq97_Ao_sExKVxEZTj-xmmVYWu1VIMwicDtN71USeero-ll31FrK_GEQ4wgALbnLifDaROQg5s22gomR-EDZHkE5ERMkKcoLGURYZ5jIzwPxUVREefVKIKl_UxC1g9LSQIwJo4_w0XnDROlyjEjzyPkDVnM8S4QpsHzDpT6RZZ20cbkmiQK0nNx0186QhP7g',
      variant: 'Deep Navy • Leather',
      quantity: 2,
      selected: true,
    },
    {
      id: 3,
      name: 'AquaSmart Flask',
      price: '$55.00',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAQqa1XmxdGXs34FjocJXX95wKQJo23QC0X6_-JiLlnjFYoxwkouos4vS7qe6bAe3nqIUmMclrRf2_cwrJaO47d06jOqIiNpiCT6oGZCeWyvb_lrzHGhUx37KJrfy4_IebMcj1AF8v2-jJjs29wkPmsp7yiNKiV2dOJ_mfE9VkZcwEbVE9pDJ5PGAWMEo9PIeqAmqz7QETFookE78JEvWpiJGOzrfQDz7uNrXNeYd-tDO2jpwaUzZuY8w',
      variant: null,
      quantity: 1,
      selected: true,
    },
  ])

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, selected: true } : item
        )
      }
      return [...prev, { ...product, quantity: 1, selected: true }]
    })
  }

  const increment = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    )
  }

  const decrement = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))
    )
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    )
  }

  const toggleSelectAll = () => {
    setItems((prev) => {
      const allSelected = prev.every((item) => item.selected)
      return prev.map((item) => ({ ...item, selected: !allSelected }))
    })
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  const selectedCount = items.filter((item) => item.selected).length

  const selectedSubtotal = useMemo(
    () => items.filter((item) => item.selected).reduce((sum, item) => sum + Number.parseFloat(item.price.replace('$', '')) * item.quantity, 0),
    [items]
  )

  const tax = selectedSubtotal * 0.02
  const total = selectedSubtotal + tax

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        increment,
        decrement,
        removeItem,
        toggleSelect,
        toggleSelectAll,
        count,
        selectedCount,
        selectedSubtotal,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
