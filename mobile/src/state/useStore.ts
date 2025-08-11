import { create } from 'zustand'

export type ApiVersion = 'v1' | 'v2'

interface CartItem { productId: number; quantity: number }

interface AppState {
  apiBaseUrl: string
  apiVersion: ApiVersion
  scenario: string | null
  cart: CartItem[]
  lastTraceIds: string[]
  setApiBaseUrl: (url: string) => void
  setApiVersion: (v: ApiVersion) => void
  setScenario: (s: string | null) => void
  addToCart: (productId: number, quantity?: number) => void
  clearCart: () => void
  pushTraceId: (id: string | null | undefined) => void
}

export const useStore = create<AppState>((set, get) => ({
  apiBaseUrl: 'http://127.0.0.1:8000',
  apiVersion: 'v1',
  scenario: null,
  cart: [],
  lastTraceIds: [],
  setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
  setApiVersion: (v) => set({ apiVersion: v }),
  setScenario: (s) => set({ scenario: s }),
  addToCart: (productId, quantity = 1) => {
    const existing = get().cart.find(c => c.productId === productId)
    if (existing) {
      set({ cart: get().cart.map(c => c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c) })
    } else {
      set({ cart: [...get().cart, { productId, quantity }] })
    }
  },
  clearCart: () => set({ cart: [] }),
  pushTraceId: (id) => {
    if (!id) return
    const next = [id, ...get().lastTraceIds].slice(0, 5)
    set({ lastTraceIds: next })
  },
}))
