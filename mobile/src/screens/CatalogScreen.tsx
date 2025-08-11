import React from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme'
import { apiGet } from '@/api/client'
import { useStore } from '@/state/useStore'

interface Product { id: number; name: string; price_cents: number; image_url?: string; inventory?: number | null }

export default function CatalogScreen({ navigation }: any) {
  const [loading, setLoading] = React.useState(true)
  const [products, setProducts] = React.useState<Product[]>([])
  const { apiVersion, addToCart } = useStore()

  React.useEffect(() => {
    setLoading(true)
    const path = apiVersion === 'v1' ? '/api/v1/products' : '/api/v2/catalog?include=inventory'
    apiGet<Product[]>(path).then(setProducts).finally(() => setLoading(false))
  }, [apiVersion])

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary}/></View>

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: spacing(2) }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Product', { product: item })}>
          {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>${(item.price_cents / 100).toFixed(2)}</Text>
            {item.inventory != null && <Text style={styles.inventory}>In stock: {item.inventory}</Text>}
          </View>
          <TouchableOpacity style={styles.add} onPress={() => addToCart(item.id, 1)}>
            <Text style={{ color: 'white' }}>Add</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  card: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing(2), marginBottom: spacing(2), borderRadius: 12, alignItems: 'center' },
  image: { width: 72, height: 72, borderRadius: 8, marginRight: spacing(2) },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  price: { marginTop: 4, color: colors.indigo },
  inventory: { marginTop: 4, color: colors.muted },
  add: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
})
