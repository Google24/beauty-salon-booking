import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const ACCESS_TOKEN_KEY = 'access'
export const REFRESH_TOKEN_KEY = 'refresh'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens({ access, refresh } = {}) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function decodeToken(token = getAccessToken()) {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )

    return JSON.parse(json)
  } catch {
    return null
  }
}

export function tokenHasAdminRole(token = getAccessToken()) {
  const payload = decodeToken(token)

  return Boolean(payload?.role === 'admin' || payload?.is_staff || payload?.is_superuser)
}

function notifyUnauthorized() {
  clearTokens()
  window.dispatchEvent(new CustomEvent('app:unauthorized'))

  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

export function getErrorMessage(error, fallback = 'Не удалось выполнить запрос') {
  const data = error?.response?.data || error?.data

  if (typeof data === 'string') return data
  if (data?.detail) return data.detail
  if (data?.message) return data.message

  if (data && typeof data === 'object') {
    const firstField = Object.values(data)[0]

    if (Array.isArray(firstField) && firstField.length) return String(firstField[0])
    if (typeof firstField === 'string') return firstField
  }

  return error?.message || fallback
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

let refreshRequest = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const url = originalRequest?.url || ''

    const isAuthCall = url.includes('/auth/login/') || url.includes('/auth/token/refresh/')

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
      const refresh = getRefreshToken()

      if (!refresh) {
        notifyUnauthorized()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        if (!refreshRequest) {
          refreshRequest = axios
            .post(`${API_URL}/auth/token/refresh/`, { refresh })
            .finally(() => {
              refreshRequest = null
            })
        }

        const { data } = await refreshRequest
        setTokens({ access: data.access })

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${data.access}`,
        }

        return api(originalRequest)
      } catch {
        notifyUnauthorized()
        return Promise.reject(error)
      }
    }

    if (status === 401 && isAuthCall) {
      error.data = error.response?.data
      error.status = status
      return Promise.reject(error)
    }

    error.status = status
    error.data = error.response?.data

    return Promise.reject(error)
  },
)

export { api }
export default api
