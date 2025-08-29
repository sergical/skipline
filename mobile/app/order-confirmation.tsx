import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ENABLE_ARTIFICIAL_DELAYS } from "../lib/api";
import * as Sentry from "@sentry/react-native";

function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = String(params.orderId || "TEST123");
  const total = String(params.total || "0.00");
  const email = String(params.email || "demo@example.com");

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
  const iconColor = useThemeColor(
    { light: "#666666", dark: "#999999" },
    "text",
  );

  useEffect(() => {
    // Artificial delay for order confirmation loading
    if (ENABLE_ARTIFICIAL_DELAYS) {
      const timer = setTimeout(() => {
        // Heavy computation to simulate processing
        let result = 0;
        for (let i = 0; i < 50000; i++) {
          result += Math.sqrt(Math.random() * i);
        }
        void result; // Prevent unused variable warning
      }, 100);
      return () => clearTimeout(timer);
    }

    // Prevent going back to checkout screen
    const unsubscribe = router.canGoBack() && router.back;
    return () => {
      if (unsubscribe) {
        router.setParams({});
      }
    };
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Sentry.TimeToFullDisplay record={true} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.animatedContainer}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#2E7D32" />
          </View>

          <ThemedText
            type="title"
            style={{ textAlign: "center", marginTop: 20 }}
          >
            Thank You!
          </ThemedText>

          <ThemedText
            style={{
              textAlign: "center",
              opacity: 0.7,
              marginTop: 8,
              fontSize: 16,
            }}
          >
            Your order has been confirmed
          </ThemedText>

          <ThemedView
            style={[styles.orderCard, { backgroundColor: cardBg, borderColor }]}
          >
            <View style={styles.orderHeader}>
              <ThemedText style={{ fontWeight: "700", fontSize: 18 }}>
                Order #{orderId}
              </ThemedText>
              <ThemedText
                style={{ fontWeight: "700", fontSize: 20, color: accentColor }}
              >
                ${total}
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.orderDetails}>
              <View style={styles.orderDetail}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.detailText}>
                  Confirmation sent to {email}
                </ThemedText>
              </View>

              <View style={styles.orderDetail}>
                <View style={styles.iconContainer}>
                  <Ionicons name="time-outline" size={20} color={iconColor} />
                </View>
                <ThemedText style={styles.detailText}>
                  Estimated delivery: 2-3 business days
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedText
            style={{
              textAlign: "center",
              opacity: 0.6,
              marginTop: 24,
              fontSize: 14,
            }}
          >
            We&apos;ll send you tracking information once your order ships.
          </ThemedText>
          <Pressable
            onPress={() => {
              router.replace("/(tabs)");
            }}
            style={{ marginTop: 32 }}
          >
            <View
              style={[styles.continueButton, { backgroundColor: accentColor }]}
            >
              <ThemedText style={styles.buttonText}>
                Continue Shopping
              </ThemedText>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Sentry.withProfiler(OrderConfirmationScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: "center",
  },
  animatedContainer: {
    alignItems: "center",
    width: "100%",
  },
  orderCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 32,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 4,
  },
  orderDetails: {
    marginTop: 8,
  },
  orderDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
  },
  detailText: {
    marginLeft: 12,
    opacity: 0.8,
    flex: 1,
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  continueButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  successIcon: {
    alignItems: "center",
  },
});
