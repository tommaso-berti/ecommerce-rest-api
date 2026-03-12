import { request } from '../lib/http'

export function register(payload) {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
