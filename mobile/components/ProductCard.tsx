import React from 'react';
import { Pressable, StyleSheet, View, Text, Image } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { Product } from '@/lib/api';

type Props = {
  product: Product;
  onAddToCart: () => void;
};

export function ProductCard({ product, onAddToCart }: Props) {
  const buttonScale = useSharedValue(1);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#333' }, 'background');
  const accentColor = useThemeColor({ light: '#0B6E6E', dark: '#2E7D32' }, 'tint');

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleAddToCart = () => {
    onAddToCart();
  };

  // Generate placeholder image based on product ID
  const placeholderImage = `https://picsum.photos/seed/${product.id}/400/300`;

  return (
    <Animated.View style={[styles.card, { backgroundColor, borderColor }]}>
      <Image 
        source={{ uri: product.image_url || placeholderImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <View>
            <Text style={[styles.price, { color: accentColor }]}>
              ${(product.price_cents / 100).toFixed(2)}
            </Text>
            {product.inventory !== null && (
              <Text style={[styles.stock, { color: textColor, opacity: 0.6 }]}>
                {product.inventory} in stock
              </Text>
            )}
          </View>
          <Pressable 
            onPress={handleAddToCart}
            onPressIn={() => buttonScale.value = withTiming(0.97, { duration: 150 })}
            onPressOut={() => buttonScale.value = withTiming(1, { duration: 150 })}
            accessibilityLabel={`Add ${product.name} to cart`}
            accessibilityRole="button"
            testID={`add-to-cart-${product.id}`}
          >
            <Animated.View style={[buttonAnimatedStyle, styles.cartButton, { backgroundColor: accentColor }]}>
              <View style={styles.cartButtonContent}>
                <Ionicons name="cart-outline" size={20} color="white" />
                <Text style={styles.cartButtonText}>Add</Text>
              </View>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    minHeight: 36,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  stock: {
    fontSize: 14,
    marginTop: 2,
  },
  cartButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
