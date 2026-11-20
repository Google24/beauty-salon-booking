import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, login } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        setToken(null)
        setUser(null)
      })
  }, [token])

  async function signIn(email, password) {
    const tokens = await login(email, password)

    localStorage.setItem('access', tokens.access)
    localStorage.setItem('refresh', tokens.refresh)
    setToken(tokens.access)

    const currentUser = await getMe(tokens.access)
    setUser(currentUser)
  }

  function signOut() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setToken(null)
    setUser(null)
  }

  function updateUser(updatedUser) {
    setUser(updatedUser)
  }

  const value = useMemo(
    () => ({ token, user, signIn, signOut, updateUser }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}