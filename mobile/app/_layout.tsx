import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { isRunningInExpoGo } from "expo";
import { Stack, useNavigationContainerRef } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import * as Sentry from "@sentry/react-native";

import { useEffect } from "react";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: SENTRY_DSN,
  debug: true,
  tracesSampleRate: 1.0,

  profilesSampleRate: 1.0,

  enableAutoSessionTracking: true,
  enableNdkScopeSync: true,

  // React Native specific tracing options
  enableNativeFramesTracking: true,
  enableStallTracking: true,
  enableAppStartTracking: true,
  enableUserInteractionTracing: true,

  integrations: [navigationIntegration],

  // Session replay
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
});

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const ref = useNavigationContainerRef();
  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Sentry.TouchEventBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="checkout"
            options={{
              title: "Checkout",
              headerBackTitle: "Home",
            }}
          />
          <Stack.Screen
            name="order-confirmation"
            options={{
              title: "Order Confirmation",
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Sentry.TouchEventBoundary>
  );
});
