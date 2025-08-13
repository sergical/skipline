import { create } from 'zustand';
import type { CartItem, CheckoutRequest } from '../lib/api';

type CartStore = {
  items: CartItem[];
  add: (product_id: number, quantity?: number) => void;
  remove: (product_id: number) => void;
  clear: () => void;
  toCheckoutPayload: (email: string) => CheckoutRequest;
};

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  add: (product_id: number, quantity = 1) =>
    set(state => {
      const existing = state.items.find(i => i.product_id === product_id);
      if (existing) {
        return {
          items: state.items.map(i => (i.product_id === product_id ? { ...i, quantity: i.quantity + quantity } : i)),
        };
      }
      return { items: [...state.items, { product_id, quantity }] };
    }),
  remove: (product_id: number) => set(state => ({ items: state.items.filter(i => i.product_id !== product_id) })),
  clear: () => set({ items: [] }),
  toCheckoutPayload: (email: string) => ({
    user_email: email,
    items: get().items,
    address: '123 Main St, SF',
    coupon_code: null,
    payment_token: 'tok_demo',
  }),
}));


