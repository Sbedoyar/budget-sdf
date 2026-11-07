import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../utils/getErrorMessage'

// Usa una función de módulo o un useCallback para recargar solo cuando cambien los criterios.
export function useFetch(loadData, { initialData = null, fallbackMessage = 'No fue posible cargar los datos' } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const mounted = useRef(false)
  const requestId = useRef(0)

  const runRequest = useCallback(async (isRefresh) => {
    if (!mounted.current) return

    const id = ++requestId.current
    const isCurrent = () => mounted.current && id === requestId.current

    if (!isRefresh) setLoading(true)
    setRefreshing(isRefresh)
    setError('')

    try {
      const result = await loadData()
      if (isCurrent()) setData(result)
    } catch (requestError) {
      if (isCurrent()) setError(getErrorMessage(requestError, fallbackMessage))
    } finally {
      if (isCurrent()) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [loadData, fallbackMessage])

  useEffect(() => {
    mounted.current = true
    const scheduledId = requestId.current

    // Omite la carga programada si el efecto se limpia o ya empezó otra solicitud.
    queueMicrotask(() => {
      if (requestId.current === scheduledId) runRequest(false)
    })

    return () => {
      mounted.current = false
      requestId.current += 1
    }
  }, [runRequest])

  const refetch = useCallback(() => runRequest(true), [runRequest])

  return { data, loading, refreshing, error, refetch }
}
