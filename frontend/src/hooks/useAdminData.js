import { useCallback, useEffect, useRef, useState } from 'react'

export function useAdminData(load, deps = []) {
  const loadRef = useRef(load)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRef.current = load
  }, [load])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await loadRef.current()
      setData(result)
      return result
    } catch (requestError) {
      setError(requestError)
      return null
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    reload()
  }, [reload])

  return {
    data,
    setData,
    loading,
    error,
    forbidden: error?.status === 403 || error?.status === 401,
    reload,
  }
}

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)

    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
