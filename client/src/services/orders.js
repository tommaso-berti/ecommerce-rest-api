import { request } from '../lib/http'

export function getOrders() {
  return request('/api/orders')
}

export function getOrderById(orderId) {
  return request(`/api/orders/${orderId}`)
}
