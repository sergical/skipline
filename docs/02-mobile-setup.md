## Mobile setup (Expo + React Native + Zustand)

Prereqs: Node 18+, Expo CLI.

- Create app
  ```bash
  cd skipline
  npx create-expo-app@latest mobile --template
  ```

- Install deps
  ```bash
  cd mobile
  npm i @sentry/react-native zustand
  npx @sentry/wizard@latest -i reactNative -p ios android
  ```

- Configure Sentry in `mobile` entry (created by wizard) and set:
  ```ts
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    enableAutoPerformanceTracing: true,
    profilesSampleRate: 1.0,
    tracePropagationTargets: [/localhost:\\d+/, /127.0.0.1/],
  })
  ```

- Create env (or use Expo env) in `mobile` with:
  ```env
  EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
  EXPO_PUBLIC_SENTRY_DSN=your_dsn
  ```

- (Optional) Developer screen to toggle scenarios. The app can send:
  - `X-Scenario`
  - Use different paths `/api/v1` vs `/api/v2`.

- Start app
  ```bash
  npx expo start
  ```
