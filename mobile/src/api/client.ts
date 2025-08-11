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
  return Sentry.startSpan(
    {
      name: `GET ${path}`,
      op: 'http.client',
      attributes: { 'http.method': 'GET', 'http.url': url },
    },
    async span => {
      const res = await fetch(url, { headers: getHeaders() })
      const data = await res.json()
      const traceId = span.spanContext().traceId
      useStore.getState().pushTraceId(traceId)
      return data as T
    },
  )
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const { apiBaseUrl } = useStore.getState()
  const url = `${apiBaseUrl}${path}`
  return Sentry.startSpan(
    {
      name: `POST ${path}`,
      op: 'http.client',
      attributes: { 'http.method': 'POST', 'http.url': url },
    },
    async span => {
      const res = await fetch(url, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) })
      const data = await res.json()
      if (data && typeof data === 'object' && 'trace_id' in data) {
        useStore.getState().pushTraceId((data as any).trace_id)
      } else {
        const traceId = span.spanContext().traceId
        useStore.getState().pushTraceId(traceId)
      }
      return data as T
    },
  )
}
