import { apiRequest } from './client'

export function getUsers(search = '', token) {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''

  return apiRequest(`/auth/users/${query}`, { token })
}

export function updateUserRole(id, role, token) {
  return apiRequest(`/auth/users/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ role }),
  })
}
