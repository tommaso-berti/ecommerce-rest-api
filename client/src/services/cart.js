import { request } from '../lib/http'

export function getMyCart() {
  return request('/api/cart/me')
}

export function replaceMyCartItems(items) {
  return request('/api/cart/me/items', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
}

export function updateMyCartItem(productId, quantity) {
  return request(`/api/cart/me/items/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })
}

export function deleteMyCartItem(productId) {
  return request(`/api/cart/me/items/${productId}`, {
    method: 'DELETE',
  })
}
