import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, RefreshControl } from 'react-native';

import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { ProductCard } from '@/components/ProductCard';
import { apiGet, Product } from '../../lib/api';
import { useCart } from '../../state/useCart';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Sentry from '@sentry/react-native';

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { add } = useCart();
  const backgroundColor = useThemeColor({}, 'background');

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      Sentry.logger.debug('Refreshing product catalog');
    } else {
      setLoading(true);
      Sentry.logger.debug('Loading product catalog');
    }
    try {
      const data = await apiGet<Product[]>('/api/v1/catalog?include=inventory');
      setProducts(data);
      Sentry.logger.info('Product catalog loaded', {
        productCount: data.length,
        isRefresh,
      });
    } catch (error) {
      Sentry.logger.error('Failed to load product catalog', {
        error: error instanceof Error ? error.message : 'Unknown error',
        isRefresh,
      });
      throw error;
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoaded(true);
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
      <Sentry.TimeToFullDisplay record={loaded} />
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        testID={loaded && products && products.length > 0 ? "products-loaded" : undefined}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.floor(index / 2) * 100).springify()}
            style={styles.cardContainer}
            testID={index === 0 ? "first-product-card" : undefined}
          >
            <ProductCard 
              product={item} 
              onAddToCart={() => {
                add(item.id, 1);
                Sentry.logger.info('Product added to cart', {
                  productId: item.id,
                  productName: item.name,
                  price: item.price_cents / 100,
                });
              }}
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
