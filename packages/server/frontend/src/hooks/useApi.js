import { useState, useEffect, useCallback, useRef } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import api from '../api/axios'

// ─── Generic fetch hook ──────────────────────────────
export function useFetch(endpoint, options = {}) {
  const { params = {}, immediate = true, deps = [] } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  const fetch = useCallback(async (overrideParams = {}) => {
    if (controllerRef.current) controllerRef.current.abort()
    controllerRef.current = new AbortController()
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(endpoint, {
        params: { ...params, ...overrideParams },
        signal: controllerRef.current.signal,
      })
      setData(res.data)
    } catch (err) {
      if (err.name !== 'CanceledError') setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [endpoint, JSON.stringify(params)])

  useEffect(() => {
    if (immediate) fetch()
    return () => controllerRef.current?.abort()
  }, [fetch, ...deps])

  return { data, loading, error, refetch: fetch }
}

// ─── Debounced search hook ────────────────────────────
export function useSearch(endpoint) {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounceValue(query, 400)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return }
    let cancelled = false
    setLoading(true)
    api.get(endpoint, { params: { q: debouncedQuery } })
      .then(res => { if (!cancelled) setResults(res.data.results || res.data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery, endpoint])

  return { query, setQuery, results, loading }
}

// ─── Pagination hook ──────────────────────────────────
export function usePagination(endpoint, perPage = 12) {
  const [page, setPage] = useState(1)
  const [allData, setAllData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})

  const fetch = useCallback(async (reset = false) => {
    setLoading(true)
    try {
      const currentPage = reset ? 1 : page
      const res = await api.get(endpoint, {
        params: { page: currentPage, limit: perPage, ...filters }
      })
      const { data, total: t } = res.data
      if (reset) { setAllData(data); setPage(1) }
      else setAllData(prev => currentPage === 1 ? data : [...prev, ...data])
      setTotal(t || data.length)
    } catch {}
    finally { setLoading(false) }
  }, [endpoint, page, perPage, filters])

  useEffect(() => { fetch(true) }, [filters])
  useEffect(() => { if (page > 1) fetch(false) }, [page])

  const loadMore = () => setPage(p => p + 1)
  const applyFilters = (f) => setFilters(f)
  const hasMore = allData.length < total

  return { data: allData, total, loading, hasMore, loadMore, applyFilters, filters }
}

// ─── Mutation hook (post/put/delete) ─────────────────
export function useMutation(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      return result
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { mutate, loading, error }
}