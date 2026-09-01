import { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react'
import { useAuth } from './AuthContext'
import * as cartApi from '../lib/supabase'

const CartContext = createContext()

function normalizeItem(raw) {
  const p = raw.product_id ? raw.products : raw
  return {
    id: raw.id,
    productId: raw.product_id,
    variantId: raw.variant_id,
    name: p?.name || 'Unknown Product',
    price: Number(p?.price || 0) + Number(raw.product_variants?.price_adjustment || 0),
    image: p?.image_url || null,
    variant: raw.product_variants?.name || null,
    quantity: raw.quantity || 1,
    selected: raw.selected !== false,
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const isAuthed = !!user

  const loadCart = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const data = await cartApi.getCart()
      setItems((data || []).map(normalizeItem))
    } catch (err) {
      console.error('Failed to load cart:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadCart()
  }, [user, loadCart])

  const applyServerCart = useCallback((cart) => {
    setItems((cart || []).map(normalizeItem))
  }, [])

  const addItem = useCallback(
    async (product) => {
      if (!isAuthed) return
      try {
        const res = await cartApi.addToCart(product.productId, product.variantId || null, product.quantity || 1)
        applyServerCart(res.cart)
        return res
      } catch (err) {
        console.error('Failed to add to cart:', err)
        throw err
      }
    },
    [isAuthed, applyServerCart]
  )

  const increment = useCallback(
    async (id) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      try {
        const res = await cartApi.updateCartItem(id, { quantity: item.quantity + 1 })
        applyServerCart(res.cart)
      } catch (err) {
        console.error('Failed to increment:', err)
      }
    },
    [items, applyServerCart]
  )

  const decrement = useCallback(
    async (id) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      const next = item.quantity - 1
      if (next < 1) return
      try {
        const res = await cartApi.updateCartItem(id, { quantity: next })
        applyServerCart(res.cart)
      } catch (err) {
        console.error('Failed to decrement:', err)
      }
    },
    [items, applyServerCart]
  )

  const removeItem = useCallback(
    async (id) => {
      try {
        const res = await cartApi.removeCartItem(id)
        applyServerCart(res.cart)
      } catch (err) {
        console.error('Failed to remove item:', err)
      }
    },
    [applyServerCart]
  )

  const removeSelected = useCallback(async () => {
    try {
      const res = await cartApi.removeSelectedCartItems()
      applyServerCart(res.cart)
    } catch (err) {
      console.error('Failed to remove selected:', err)
    }
  }, [applyServerCart])

  const toggleSelect = useCallback(
    async (id) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      try {
        const res = await cartApi.updateCartItem(id, { selected: !item.selected })
        applyServerCart(res.cart)
      } catch (err) {
        console.error('Failed to toggle select:', err)
      }
    },
    [items, applyServerCart]
  )

  const toggleSelectAll = useCallback(async () => {
    const allSelected = items.length > 0 && items.every((i) => i.selected)
    const updates = items.map((i) => cartApi.updateCartItem(i.id, { selected: !allSelected }))
    try {
      await Promise.all(updates)
      await loadCart()
    } catch (err) {
      console.error('Failed to toggle all:', err)
    }
  }, [items, loadCart])

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items])
  const selectedCount = selectedItems.length

  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  )

  const tax = selectedSubtotal * 0.02
  const total = selectedSubtotal + tax

  const value = {
    items,
    loading,
    isAuthed,
    addItem,
    increment,
    decrement,
    removeItem,
    removeSelected,
    toggleSelect,
    toggleSelectAll,
    count,
    selectedCount,
    selectedItems,
    selectedSubtotal,
    tax,
    total,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
