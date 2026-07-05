import { supabase } from '../utils/supabaseClient'

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug, icon)')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug, icon)')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}
