import { request } from '../lib/http'

export function getProducts() {
  return request('/api/products')
}

export function getProductById(productId) {
  return request(`/api/products/${productId}`)
}
