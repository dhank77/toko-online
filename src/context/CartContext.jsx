import { useState, useEffect, createContext, useContext, useMemo, useCallback, useRef } from 'react'
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

const itemKey = (item) => `${item.productId}:${item.variantId || 'null'}`

function makeOptimisticItem(product) {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: product.productId,
    variantId: product.variantId || null,
    name: product.name || 'Item',
    price: Number(product.price || 0),
    image: product.image || null,
    variant: product.variant || null,
    quantity: product.quantity || 1,
    selected: true,
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const seqRef = useRef(0)

  const isAuthed = !!user

  const applyServerCart = useCallback((cart) => {
    setItems((cart || []).map(normalizeItem))
  }, [])

  const loadCart = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const data = await cartApi.getCart()
      applyServerCart(data)
    } catch (err) {
      console.error('Failed to load cart:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user, applyServerCart])

  useEffect(() => {
    loadCart()
  }, [user, loadCart])

  // Replace a local item by id (or by product key for optimistic temp items)
  const mergeItem = useCallback((serverItem) => {
    setItems((prev) => prev.map((i) => (i.id === serverItem.id ? serverItem : i)))
  }, [])

  const addItem = useCallback(
    async (product) => {
      if (!isAuthed) {
        throw new Error('Please login to add items to your cart')
      }
      const optimistic = makeOptimisticItem(product)
      const seq = ++seqRef.current

      setItems((prev) => {
        const existing = prev.find((i) => itemKey(i) === itemKey(optimistic))
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + product.quantity, selected: true } : i
          )
        }
        return [...prev, optimistic]
      })

      try {
        const res = await cartApi.addToCart(product.productId, product.variantId || null, product.quantity || 1)
        if (res?.item && seq === seqRef.current) {
          const normalized = normalizeItem(res.item)
          setItems((prev) => {
            const existing = prev.find((i) => itemKey(i) === itemKey(normalized))
            return existing
              ? prev.map((i) => (i.id === existing.id ? normalized : i))
              : [...prev, normalized]
          })
        }
        return res
      } catch (err) {
        console.error('Failed to add to cart:', err)
        loadCart()
        throw err
      }
    },
    [isAuthed, loadCart]
  )

  const updateQuantity = useCallback(
    async (id, newQuantity) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      const seq = ++seqRef.current
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i)))
      try {
        const res = await cartApi.updateCartItem(id, { quantity: newQuantity })
        if (res?.item && seq === seqRef.current) mergeItem(normalizeItem(res.item))
      } catch (err) {
        console.error('Failed to update quantity:', err)
        loadCart()
      }
    },
    [items, loadCart, mergeItem]
  )

  const increment = useCallback(
    (id) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      updateQuantity(id, item.quantity + 1)
    },
    [items, updateQuantity]
  )

  const removeItem = useCallback(
    async (id) => {
      const seq = ++seqRef.current
      setItems((prev) => prev.filter((i) => i.id !== id))
      try {
        await cartApi.removeCartItem(id)
      } catch (err) {
        console.error('Failed to remove item:', err)
        loadCart()
      }
    },
    [loadCart]
  )

  const decrement = useCallback(
    (id) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      const next = item.quantity - 1
      if (next < 1) {
        removeItem(id)
        return
      }
      updateQuantity(id, next)
    },
    [items, updateQuantity, removeItem]
  )

  const removeSelected = useCallback(async () => {
    const removedIds = items.filter((i) => i.selected).map((i) => i.id)
    if (removedIds.length === 0) return
    const seq = ++seqRef.current
    setItems((prev) => prev.filter((i) => !i.selected))
    try {
      await cartApi.removeSelectedCartItems()
    } catch (err) {
      console.error('Failed to remove selected:', err)
      loadCart()
    }
  }, [items, loadCart])

  const toggleSelect = useCallback(
    async (id) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      const seq = ++seqRef.current
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !item.selected } : i)))
      try {
        const res = await cartApi.updateCartItem(id, { selected: !item.selected })
        if (res?.item && seq === seqRef.current) mergeItem(normalizeItem(res.item))
      } catch (err) {
        console.error('Failed to toggle select:', err)
        loadCart()
      }
    },
    [items, loadCart, mergeItem]
  )

  const toggleSelectAll = useCallback(async () => {
    const allSelected = items.length > 0 && items.every((i) => i.selected)
    const seq = ++seqRef.current
    setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })))
    try {
      await cartApi.setAllCartSelected(!allSelected)
    } catch (err) {
      console.error('Failed to toggle all:', err)
      loadCart()
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