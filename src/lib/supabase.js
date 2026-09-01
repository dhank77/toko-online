import { api } from '../utils/api'

export async function getProducts(page = 1, limit = 12) {
  return api.getProducts(page, limit)
}

export async function getProductBySlug(slug) {
  return api.getProductBySlug(slug)
}

export async function getCategories() {
  return api.getCategories()
}

export async function getCart() {
  return api.getCart()
}

export async function addToCart(product_id, variant_id, quantity = 1) {
  return api.addToCart(product_id, variant_id, quantity)
}

export async function updateCartItem(id, updates) {
  return api.updateCartItem(id, updates)
}

export async function setAllCartSelected(selected) {
  return api.setAllCartSelected(selected)
}

export async function removeCartItem(id) {
  return api.removeCartItem(id)
}

export async function removeSelectedCartItems() {
  return api.removeSelectedCartItems()
}
