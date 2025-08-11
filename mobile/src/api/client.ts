import * as Sentry from '@sentry/react-native'
import { useStore } from '@/state/useStore'

function getHeaders() {
  const { scenario } = useStore.getState()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (scenario) headers['X-Scenario'] = scenario
  return headers
}

export async function apiGet<T>(path: string): Promise<T> {
  const { apiBaseUrl } = useStore.getState()
  const url = `${apiBaseUrl}${path}`
  const span = Sentry.startSpan({ op: 'http.client', description: `GET ${path}` })
  try {
    const res = await fetch(url, { headers: getHeaders() })
    const data = await res.json()
    const traceId = Sentry.getCurrentHub().getScope()?.getTransaction()?.traceId
    useStore.getState().pushTraceId(traceId)
    return data as T
  } finally {
    span.end()
  }
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const { apiBaseUrl } = useStore.getState()
  const url = `${apiBaseUrl}${path}`
  const span = Sentry.startSpan({ op: 'http.client', description: `POST ${path}` })
  try {
    const res = await fetch(url, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) })
    const data = await res.json()
    if ('trace_id' in data) {
      useStore.getState().pushTraceId((data as any).trace_id)
    } else {
      const traceId = Sentry.getCurrentHub().getScope()?.getTransaction()?.traceId
      useStore.getState().pushTraceId(traceId)
    }
    return data as T
  } finally {
    span.end()
  }
}
