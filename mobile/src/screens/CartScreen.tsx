import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { colors, spacing } from '@/theme'
import { useStore } from '@/state/useStore'
import { apiPost } from '@/api/client'

export default function CartScreen() {
  const { cart, clearCart, apiVersion } = useStore()
  const [coupon, setCoupon] = React.useState('SAVE10')
  const [status, setStatus] = React.useState<string | null>(null)

  const checkout = async () => {
    const path = apiVersion === 'v1' ? '/api/v1/checkout' : '/api/v2/checkout'
    const res = await apiPost<{ order_id: number; total_cents: number; status: string }>(path, {
      user_email: 'demo@skipline.app',
      items: cart.map(c => ({ product_id: c.productId, quantity: c.quantity })),
      coupon_code: coupon,
      address: '1 Market St, SF',
      payment_token: 'tok_demo',
    })
    setStatus(`Order ${res.order_id} ${res.status} • $${(res.total_cents/100).toFixed(2)}`)
    clearCart()
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(i) => String(i.productId)}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.item}>Product {item.productId}</Text>
            <Text style={styles.qty}>x{item.quantity}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <TextInput style={styles.input} placeholder="Coupon" value={coupon} onChangeText={setCoupon} />
        <TouchableOpacity style={styles.cta} onPress={checkout}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Checkout</Text>
        </TouchableOpacity>
      </View>
      {status && <Text style={styles.status}>{status}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand, padding: spacing(2) },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing(1) },
  item: { color: colors.text },
  qty: { color: colors.muted },
  footer: { flexDirection: 'row', gap: spacing(1), alignItems: 'center' },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 10, padding: 12 },
  cta: { backgroundColor: colors.primary, padding: 12, borderRadius: 10 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: spacing(3) },
  status: { marginTop: spacing(2), color: colors.indigo },
})
