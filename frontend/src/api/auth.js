import { apiRequest } from './client'

export function login(email, password) {
  return apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}