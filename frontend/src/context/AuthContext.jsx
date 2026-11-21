import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, login } from '../api/auth'
import { clearTokens, getAccessToken } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAccessToken())
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    if (!token) {
      setReady(true)
      return () => {
        isMounted = false
      }
    }

    setReady(false)

    getMe()
      .then((currentUser) => {
        if (isMounted) setUser(currentUser)
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
        }
      })
      .finally(() => {
        if (isMounted) setReady(true)
      })

    return () => {
      isMounted = false
    }
  }, [token])

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null)
      setUser(null)
      setReady(true)
    }

    window.addEventListener('app:unauthorized', handleUnauthorized)

    return () => window.removeEventListener('app:unauthorized', handleUnauthorized)
  }, [])

  async function signIn(email, password) {
    const tokens = await login(email, password)

    setToken(tokens.access)

    const currentUser = await getMe()
    setUser(currentUser)

    return currentUser
  }

  function signOut() {
    clearTokens()
    setToken(null)
    setUser(null)
  }

  function updateUser(updatedUser) {
    setUser(updatedUser)
  }

  const value = useMemo(
    () => ({ token, user, ready, signIn, signOut, updateUser }),
    [token, user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
