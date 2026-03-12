import { request } from '../lib/http'

export function register(payload) {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logout() {
  return request('/api/logout', {
    method: 'POST',
  })
}

export function getCurrentUser() {
  return request('/api/me')
}
