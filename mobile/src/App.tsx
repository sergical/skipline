import React from 'react'
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import CatalogScreen from '@/screens/CatalogScreen'
import ProductScreen from '@/screens/ProductScreen'
import CartScreen from '@/screens/CartScreen'
import DeveloperScreen from '@/screens/DeveloperScreen'
import * as Sentry from '@sentry/react-native'
import { colors } from '@/theme'

Sentry.init({
  dsn: '', // set via wizard or env
  tracesSampleRate: 1.0,
  enableAutoPerformanceTracing: true,
  enableNetworkTracking: true,
  tracePropagationTargets: [/localhost:\\d+/, /127.0.0.1/],
})

const Stack = createNativeStackNavigator()

const appTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.sand,
    primary: colors.primary,
    card: 'white',
    text: colors.text,
    border: '#E8ECEF',
    notification: colors.accent,
  },
}

export default function App() {
  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Catalog" component={CatalogScreen} />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Developer" component={DeveloperScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
