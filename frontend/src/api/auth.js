import { apiRequest } from './client'

export function login(email, password) {
  return apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(token) {
  return apiRequest('/auth/me/', { token })
}

export function register(data) {
  return apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      password2: data.password2,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
    }),
  })
}