import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme'
import { useStore } from '@/state/useStore'

export default function ProductScreen({ route }: any) {
  const { product } = route.params
  const { addToCart } = useStore()

  return (
    <View style={styles.container}>
      {product.image_url && <Image source={{ uri: product.image_url }} style={styles.image} />}
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>${(product.price_cents / 100).toFixed(2)}</Text>
      <TouchableOpacity style={styles.cta} onPress={() => addToCart(product.id, 1)}>
        <Text style={{ color: 'white', fontWeight: '600' }}>Add to cart</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand, padding: spacing(3) },
  image: { width: '100%', height: 300, borderRadius: 12, marginBottom: spacing(2) },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  price: { marginTop: 6, marginBottom: 16, color: colors.indigo, fontSize: 16 },
  cta: { backgroundColor: colors.accent, alignItems: 'center', padding: 14, borderRadius: 12 },
})
