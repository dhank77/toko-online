import { supabase } from '../utils/supabaseClient.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function withTimeout(promise, ms = 8000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  )
  return Promise.race([promise, timeout])
}

async function request(path, options = {}) {
  let session = null
  try {
    const result = await supabase.auth.getSession()
    session = result.data.session
  } catch (e) {
    console.warn('Session retrieval failed:', e)
  }
  const token = session?.access_token

  const res = await withTimeout(
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: 'include',
    }),
    8000
  )

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    const err = new Error(error.error || 'Request failed')
    err.status = res.status
    err.payload = error
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  getProducts: (page = 1, limit = 12) => request(`/products?page=${page}&limit=${limit}`),
  getProductBySlug: (slug) => request(`/products/slug/${slug}`),
  createProduct: (product) => request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  updateProduct: (id, updates) => request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  deleteProduct: (id) => request(`/products/${id}`, {
    method: 'DELETE',
  }),
  getVariants: (productId) => request(`/products/${productId}/variants`),
  createVariant: (productId, variant) => request(`/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(variant),
  }),
  updateVariant: (id, updates) => request(`/variants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  deleteVariant: (id) => request(`/variants/${id}`, {
    method: 'DELETE',
  }),
  getCategories: () => request('/categories'),
  createCategory: (category) => request('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  }),
  updateCategory: (id, updates) => request(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  deleteCategory: (id) => request(`/categories/${id}`, {
    method: 'DELETE',
  }),
  getOrders: () => request('/orders'),
  updateOrderStatus: (id, status) => request(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  getCart: () => request('/cart'),
  addToCart: (product_id, variant_id, quantity = 1) => request('/cart', {
    method: 'PUT',
    body: JSON.stringify({ product_id, variant_id, quantity }),
  }),
  updateCartItem: (id, updates) => request(`/cart/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  removeCartItem: (id) => request(`/cart/${id}`, {
    method: 'DELETE',
  }),
  removeSelectedCartItems: () => request('/cart/selected/all', {
    method: 'DELETE',
  }),
  getProfile: () => request('/profiles/me'),
  updateProfile: (data) => request('/profiles/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  signup: (email, password, full_name) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  }),
}
