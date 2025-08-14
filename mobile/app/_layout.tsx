import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { isRunningInExpoGo } from "expo";
import { Stack, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import * as Sentry from '@sentry/react-native';

import { useEffect } from 'react';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const ENABLE_SENTRY_LOGS = process.env.EXPO_PUBLIC_ENABLE_SENTRY_LOGS === 'true';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: SENTRY_DSN,
  debug: true,
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  tracesSampleRate: 1.0, // adjust this in production to lower rates
  profilesSampleRate: 1.0, // adjust this in production to lower rates

  // Configure Session Replay
  replaysSessionSampleRate: 1, // adjust this in production to lower rates
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration(), navigationIntegration],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
  _experiments: {
    enableLogs: ENABLE_SENTRY_LOGS,
  }
});

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="checkout" 
          options={{ 
            title: 'Checkout',
            headerBackTitle: 'Home' 
          }} 
        />
        <Stack.Screen 
          name="order-confirmation" 
          options={{ 
            title: 'Order Confirmation',
            headerBackVisible: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
});