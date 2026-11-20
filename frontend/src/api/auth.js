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

export function changePassword(data, token) {
  return apiRequest('/auth/change-password/', {
    method: 'POST',
    token,
    body: JSON.stringify({
      old_password: data.old_password,
      new_password: data.new_password,
      new_password2: data.new_password2,
    }),
  })
}