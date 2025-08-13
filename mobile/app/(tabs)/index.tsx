import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, RefreshControl } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { ProductCard } from '@/components/ProductCard';
import { apiGet, Product } from '../../lib/api';
import { useCart } from '../../state/useCart';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { add } = useCart();
  const backgroundColor = useThemeColor({}, 'background');

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await apiGet<Product[]>('/api/v2/catalog?include=inventory');
      setProducts(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading || !products) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.floor(index / 2) * 100).springify()}
            style={styles.cardContainer}
          >
            <ProductCard 
              product={item} 
              onAddToCart={() => add(item.id, 1)}
            />
          </Animated.View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProducts(true)}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Account for tab bar height
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  cardContainer: {
    flex: 1,
  },
});
