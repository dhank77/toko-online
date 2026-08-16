import { api } from '../utils/api'

export async function getProducts() {
  return api.getProducts()
}

export async function getProductBySlug(slug) {
  return api.getProductBySlug(slug)
}

export async function getCategories() {
  return api.getCategories()
}
