import { request } from '../lib/http'

export function performCheckout(items) {
  return request('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}
