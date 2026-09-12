'use client'

import { useEffect, useRef, useState } from 'react'
import { errorMessage } from './api-client'

export function useRequest<T>(load: () => Promise<T>, dependencies: readonly unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const previousDependencies = useRef<readonly unknown[]>(dependencies)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const changed = dependencies.length !== previousDependencies.current.length || dependencies.some((value, index) => !Object.is(value, previousDependencies.current[index]))
    if (changed) setData(null)
    previousDependencies.current = [...dependencies]
    load().then(result => { if (active) setData(result) })
      .catch(reason => { if (active) setError(errorMessage(reason)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
    // Callers explicitly supply the values that identify their request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, attempt])
  return { data, setData, error, loading, retry: () => setAttempt(value => value + 1) }
}
