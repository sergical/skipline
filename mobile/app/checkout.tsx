import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiPost, apiGet, CheckoutRequest, CheckoutResponse, Product } from '../lib/api';
import { useCart } from '../state/useCart';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Sentry from '@sentry/react-native';

export default function CheckoutScreen() {
  const { items, clear, toCheckoutPayload } = useCart();
  const [email, setEmail] = useState('demo@example.com');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const buttonScale = useSharedValue(1);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#404040' }, 'text');
  const accentColor = useThemeColor({ light: '#0B6E6E', dark: '#2E7D32' }, 'tint');
  const textColor = useThemeColor({}, 'text');
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  async function loadProducts() {
    try {
      setLoadingProducts(true);
      Sentry.logger.debug('Loading products for checkout cart summary');
      const data = await apiGet<Product[]>('/api/v1/catalog');
      setProducts(data);
      Sentry.logger.info('Loaded {count} products for checkout', { count: data.length });
    } finally {
      setLoadingProducts(false);
      setLoaded(true);
    }
  }
  
  const cartProducts = items.map(item => {
    const product = products.find(p => p.id === item.product_id);
    return { ...item, product };
  }).filter(item => item.product);
  
  const subtotal = cartProducts.reduce((sum, item) => {
    return sum + (item.product!.price_cents * item.quantity);
  }, 0);
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  async function onCheckout() {
    setLoading(true);
    setResult(null);
    buttonScale.value = withTiming(0.97, { duration: 150 });
    
    try {
      const payload: CheckoutRequest = { ...toCheckoutPayload(email), coupon_code: coupon || null };
      
      Sentry.logger.info('Starting checkout process', {
        userEmail: email,
        itemCount: items.length,
        subtotal: subtotal / 100,
        hasCoupon: !!coupon,
      });
      
      const res = await apiPost<CheckoutResponse>('/api/v1/checkout', payload);
      setResult(res);
      clear();
      
      if (res.trace_id) {
        Sentry.logger.info('Checkout completed successfully', {
          orderId: res.order_id,
          total: res.total_cents / 100,
          traceId: res.trace_id,
        });
        Sentry.captureMessage('Checkout succeeded', { level: 'info', extra: { trace_id: res.trace_id } });
      }
    } catch (e: any) {
      Sentry.logger.error('Checkout failed', {
        error: e?.message || 'Unknown error',
        userEmail: email,
      });
      Sentry.captureException(e);
      Alert.alert('Checkout failed', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
      buttonScale.value = withTiming(1, { duration: 150 });
    }
  }

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <Sentry.TimeToFullDisplay record={loaded} />
      <Animated.View entering={FadeInDown.springify()}>
        <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="subtitle">Order Summary</ThemedText>
          {loadingProducts ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <View style={{ marginTop: 16 }}>
              {cartProducts.map((item, index) => (
                <View key={item.product_id} style={[styles.cartItem, { borderBottomColor: borderColor }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontWeight: '600' }}>{item.product!.name}</ThemedText>
                    <ThemedText style={{ opacity: 0.7, fontSize: 14 }}>
                      {item.quantity} × ${(item.product!.price_cents / 100).toFixed(2)}
                    </ThemedText>
                  </View>
                  <ThemedText style={{ fontWeight: '600' }}>
                    ${((item.product!.price_cents * item.quantity) / 100).toFixed(2)}
                  </ThemedText>
                </View>
              ))}
              {items.length === 0 && (
                <ThemedText style={{ opacity: 0.7, textAlign: 'center' }}>Your cart is empty</ThemedText>
              )}
              {items.length > 0 && (
                <View style={[styles.totalRow, { borderTopColor: borderColor }]}>
                  <ThemedText style={{ fontWeight: '700', fontSize: 16 }}>Subtotal</ThemedText>
                  <ThemedText style={{ fontWeight: '700', fontSize: 16, color: accentColor }}>
                    ${(subtotal / 100).toFixed(2)}
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </ThemedView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="subtitle">Contact Information</ThemedText>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <View style={[styles.inputWrapper, { borderColor, backgroundColor: cardBg }]}>
              <TextInput 
                value={email} 
                onChangeText={setEmail} 
                style={[styles.input, { color: textColor }]} 
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="your@email.com"
                placeholderTextColor={textColor + '50'}
              />
            </View>
          </View>
        </ThemedView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="subtitle">Promo Code</ThemedText>
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { borderColor, backgroundColor: cardBg }]}>
              <TextInput 
                value={coupon} 
                onChangeText={setCoupon} 
                style={[styles.input, { color: textColor }]} 
                autoCapitalize="characters"
                placeholder="Enter code (try SAVE10)"
                placeholderTextColor={textColor + '50'}
              />
            </View>
          </View>
        </ThemedView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Pressable 
          onPress={onCheckout} 
          disabled={loading || items.length === 0}
          onPressIn={() => buttonScale.value = withTiming(0.97, { duration: 150 })}
          onPressOut={() => buttonScale.value = withTiming(1, { duration: 150 })}
        >
          <Animated.View 
            style={[
              buttonAnimatedStyle,
              styles.button,
              { 
                backgroundColor: accentColor,
                opacity: (loading || items.length === 0) ? 0.7 : 1
              }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>
                Place Order
              </ThemedText>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>

      {result && (
        <Animated.View entering={FadeIn.duration(500)}>
          <ThemedView style={[styles.result, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color="#2E7D32" />
            </View>
            <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
              Order Confirmed!
            </ThemedText>
            <View style={styles.resultDetails}>
              <View style={styles.resultRow}>
                <ThemedText style={{ opacity: 0.7 }}>Order ID</ThemedText>
                <ThemedText style={{ fontWeight: '600' }}>#{result.order_id}</ThemedText>
              </View>
              <View style={styles.resultRow}>
                <ThemedText style={{ opacity: 0.7 }}>Total</ThemedText>
                <ThemedText style={{ fontWeight: '700', fontSize: 18, color: accentColor }}>
                  ${(result.total_cents / 100).toFixed(2)}
                </ThemedText>
              </View>
              {result.trace_id && (
                <View style={[styles.traceContainer, { backgroundColor: backgroundColor, borderColor }]}>
                  <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Trace ID</ThemedText>
                  <ThemedText style={{ fontSize: 12, fontFamily: 'SpaceMono' }}>
                    {result.trace_id}
                  </ThemedText>
                </View>
              )}
            </View>
          </ThemedView>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    paddingBottom: 32,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginTop: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  input: { 
    padding: 16, 
    fontSize: 16,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  result: { 
    marginTop: 24, 
    padding: 24, 
    borderRadius: 12,
    borderWidth: 1,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultDetails: {
    marginTop: 20,
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  traceContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});


