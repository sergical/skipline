import { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  apiPost,
  apiGet,
  CheckoutRequest,
  CheckoutResponse,
  Product,
  ENABLE_ARTIFICIAL_DELAYS,
} from "../lib/api";
import { useCart } from "../state/useCart";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as Sentry from "@sentry/react-native";

function CheckoutScreen() {
  const router = useRouter();
  const { items, clear, toCheckoutPayload } = useCart();
  const [email, setEmail] = useState("demo@example.com");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const buttonScale = useSharedValue(1);

  const backgroundColor = useThemeColor({}, "background");
  const cardBg = useThemeColor(
    { light: "#fff", dark: "#1a1a1a" },
    "background",
  );
  const borderColor = useThemeColor(
    { light: "#e0e0e0", dark: "#404040" },
    "text",
  );
  const accentColor = useThemeColor(
    { light: "#0B6E6E", dark: "#2E7D32" },
    "tint",
  );
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoadingProducts(true);

      // Artificial delay for performance monitoring
      if (ENABLE_ARTIFICIAL_DELAYS) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 + Math.random() * 800),
        );
      }

      const data = await apiGet<Product[]>("/api/v1/catalog");
      setProducts(data);
    } finally {
      setLoadingProducts(false);
      setLoaded(true);
    }
  }

  const cartProducts = items
    .map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return { ...item, product };
    })
    .filter((item) => item.product);

  const subtotal = cartProducts.reduce((sum, item) => {
    return sum + item.product!.price_cents * item.quantity;
  }, 0);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  async function onCheckout() {
    setLoading(true);
    buttonScale.value = withTiming(0.97, { duration: 150 });

    // Artificial processing delay for performance monitoring
    if (ENABLE_ARTIFICIAL_DELAYS) {
      // Heavy computation to cause frame drops
      const start = Date.now();
      void start; // Keep start reference for potential future use
      let result = 0;
      for (let i = 0; i < 100000; i++) {
        result += Math.sqrt(Math.random() * i);
      }
      void result; // Prevent unused variable warning

      // Additional async delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1500),
      );
    }

    try {
      const payload: CheckoutRequest = {
        ...toCheckoutPayload(email),
        coupon_code: coupon || null,
      };

      const res = await apiPost<CheckoutResponse>("/api/v1/checkout", payload);
      clear();

      // Navigate to confirmation screen
      router.replace({
        pathname: "/order-confirmation",
        params: {
          orderId: res.order_id,
          total: (res.total_cents / 100).toFixed(2),
          email: email,
        },
      });
    } catch (e: any) {
      Sentry.captureException(e);

      // Handle different types of errors
      let errorMessage = "Checkout failed. Please try again.";

      if (e?.response?.data?.detail) {
        // Handle structured API errors
        const detail = e.response.data.detail;
        if (typeof detail === "object" && detail.message) {
          errorMessage = detail.message;
        } else if (typeof detail === "string") {
          errorMessage = detail;
        }
      } else if (e?.message) {
        // Handle other errors
        errorMessage = e.message;
      }

      Alert.alert("Checkout failed", errorMessage);
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
        <ThemedView
          style={[styles.card, { backgroundColor: cardBg, borderColor }]}
        >
          <ThemedText type="subtitle">Order Summary</ThemedText>
          {loadingProducts ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <View style={{ marginTop: 16 }}>
              {cartProducts.map((item, index) => {
                // Cause frame drops on cart item rendering
                if (ENABLE_ARTIFICIAL_DELAYS && index % 2 === 0) {
                  const start = Date.now();
                  while (Date.now() - start < 12) {
                    void (Math.random() * Math.random());
                  }
                }

                return (
                  <View
                    key={item.product_id}
                    style={[
                      styles.cartItem,
                      { borderBottomColor: borderColor },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontWeight: "600" }}>
                        {item.product!.name}
                      </ThemedText>
                      <ThemedText style={{ opacity: 0.7, fontSize: 14 }}>
                        {item.quantity} × $
                        {(item.product!.price_cents / 100).toFixed(2)}
                      </ThemedText>
                    </View>
                    <ThemedText style={{ fontWeight: "600" }}>
                      $
                      {(
                        (item.product!.price_cents * item.quantity) /
                        100
                      ).toFixed(2)}
                    </ThemedText>
                  </View>
                );
              })}
              {items.length === 0 && (
                <ThemedText style={{ opacity: 0.7, textAlign: "center" }}>
                  Your cart is empty
                </ThemedText>
              )}
              {items.length > 0 && (
                <View
                  style={[styles.totalRow, { borderTopColor: borderColor }]}
                >
                  <ThemedText style={{ fontWeight: "700", fontSize: 16 }}>
                    Subtotal
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontWeight: "700",
                      fontSize: 16,
                      color: accentColor,
                    }}
                  >
                    ${(subtotal / 100).toFixed(2)}
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </ThemedView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <ThemedView
          style={[styles.card, { backgroundColor: cardBg, borderColor }]}
        >
          <ThemedText type="subtitle">Contact Information</ThemedText>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <View
              style={[
                styles.inputWrapper,
                { borderColor, backgroundColor: cardBg },
              ]}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { color: textColor }]}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="your@email.com"
                placeholderTextColor={textColor + "50"}
              />
            </View>
          </View>
        </ThemedView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <ThemedView
          style={[styles.card, { backgroundColor: cardBg, borderColor }]}
        >
          <ThemedText type="subtitle">Promo Code</ThemedText>
          <View style={styles.inputContainer}>
            <View
              style={[
                styles.inputWrapper,
                { borderColor, backgroundColor: cardBg },
              ]}
            >
              <TextInput
                value={coupon}
                onChangeText={setCoupon}
                style={[styles.input, { color: textColor }]}
                autoCapitalize="characters"
                placeholder="Enter code (try SAVE10)"
                placeholderTextColor={textColor + "50"}
              />
            </View>
          </View>
        </ThemedView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <Pressable
          onPress={onCheckout}
          disabled={loading || items.length === 0}
          onPressIn={() =>
            (buttonScale.value = withTiming(0.97, { duration: 150 }))
          }
          onPressOut={() =>
            (buttonScale.value = withTiming(1, { duration: 150 }))
          }
        >
          <Animated.View
            style={[
              buttonAnimatedStyle,
              styles.button,
              {
                backgroundColor: accentColor,
                opacity: loading || items.length === 0 ? 0.7 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>Place Order</ThemedText>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

export default Sentry.withProfiler(CheckoutScreen);

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
    shadowColor: "#000",
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
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
