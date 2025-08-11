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
    dsn: 'https://<dsn>',
    tracesSampleRate: 1.0,
    enableAutoPerformanceTracing: true,
    enableNetworkTracking: true,
    tracePropagationTargets: [/localhost:\\d+/, /127.0.0.1/],
  })
  ```

- Create `.env` in `mobile` with:
  ```env
  API_URL=http://127.0.0.1:8000
  ```

- Add a Developer screen to toggle API version headers and scenarios. The app should send:
  - `X-Scenario`
  - `X-Api-Version` (1 or 2) or call different paths `/api/v1` vs `/api/v2`.

- Start app
  ```bash
  npx expo start
  ```
