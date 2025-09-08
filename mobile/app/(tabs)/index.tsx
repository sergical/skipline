import { useEffect, useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import ProductCard from "@/components/ProductCard";
import { apiGet, Product, ENABLE_ARTIFICIAL_DELAYS } from "../../lib/api";
import { useCart } from "../../state/useCart";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as Sentry from "@sentry/react-native";

function HomeScreen() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { add } = useCart();
  const backgroundColor = useThemeColor({}, "background");
  
  // Home screen context management
  useFocusEffect(
    useCallback(() => {
      // Set context for home screen
      Sentry.withScope((scope) => {
        scope.setTag("screen", "home");
        scope.setTag("flow_type", "catalog_browse");
        scope.setContext("home_screen", {
          screen_entry_time: Date.now()
        });
      });

      if (!products) {
        loadProducts();
      }
    }, [products])
  );

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await Sentry.startSpan({
        name: "Load Home Catalog",
        op: "http.client",
        attributes: {
          "api.version": "v1",
          "api.endpoint": "/api/v1/catalog",
          "is_refresh": isRefresh,
          "includes_inventory": true
        }
      }, async (span) => {
        // Artificial delay for Sentry performance monitoring
        if (ENABLE_ARTIFICIAL_DELAYS) {
          await new Promise((resolve) =>
            setTimeout(resolve, 800 + Math.random() * 1200)
          );
        }

        const data = await apiGet<Product[]>("/api/v1/catalog?include=inventory");
        setProducts(data);
        
        span.setAttributes({
          "catalog.products_loaded": data.length,
          "catalog.load_success": true,
          "catalog.has_inventory": data.some(p => p.inventory !== undefined),
          "business.products_available": data.length,
          "business.products_in_stock": data.filter(p => (p.inventory || 0) > 0).length
        });
        
        return data;
      });
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoaded(true);
    }
  };

  // Track TTFD completion for home screen
  useEffect(() => {
    if (loaded && products) {
      Sentry.startSpan({
        name: "Home Screen TTFD",
        op: "ui.load.ttfd",
        attributes: {
          "screen": "home",
          "screen_fully_loaded": true,
          "catalog_loaded": true,
          "products_count": products.length,
          "display_complete_time": Date.now()
        }
      }, (span) => {
        span.setAttributes({
          "ui.screen_loaded": true,
          "ui.ttfd_recorded": true
        });
        return span;
      });
    }
  }, [loaded, products]);

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
        testID={
          loaded && products && products.length > 0
            ? "products-loaded"
            : undefined
        }
        renderItem={({ item, index }) => {
          // Artificial frame drops for performance monitoring
          if (ENABLE_ARTIFICIAL_DELAYS && index % 3 === 0) {
            const start = Date.now();
            while (Date.now() - start < 16) {
              // Block for ~16ms to cause frame drop
              void (Math.random() * Math.random());
            }
          }

          return (
            <Animated.View
              entering={FadeInDown.delay(
                Math.floor(index / 2) * (ENABLE_ARTIFICIAL_DELAYS ? 150 : 100)
              ).springify()}
              style={styles.cardContainer}
              testID={index === 0 ? "first-product-card" : undefined}
            >
              <ProductCard
                product={item}
                onAddToCart={() => {
                  const delay = ENABLE_ARTIFICIAL_DELAYS
                    ? Math.random() * 200 + 100
                    : 0;
                  setTimeout(() => {
                    add(item.id, 1);
                  }, delay);
                }}
              />
            </Animated.View>
          );
        }}
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

export default Sentry.withProfiler(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
