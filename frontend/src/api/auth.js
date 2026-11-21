import { api, setTokens } from './api'

export async function login(email, password) {
  const { data } = await api.post('/auth/login/', { email, password })

  setTokens(data)

  return data
}

export async function refreshToken(refresh) {
  const { data } = await api.post('/auth/token/refresh/', { refresh })

  setTokens({ access: data.access })

  return data
}

export async function getMe() {
  const { data } = await api.get('/auth/me/')

  return data
}

export function register(data) {
  return api
    .post('/auth/register/', {
      email: data.email,
      password: data.password,
      password2: data.password2,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
    })
    .then((response) => response.data)
}

export function updateMe(data) {
  return api.patch('/auth/me/', data).then((response) => response.data)
}

export function changePassword(data) {
  return api
    .post('/auth/change-password/', {
      old_password: data.old_password,
      new_password: data.new_password,
      new_password2: data.new_password2,
    })
    .then((response) => response.data)
}
