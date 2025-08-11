## Mobile notes

- After creating the Expo app, run the Sentry wizard:
  ```bash
  cd mobile
  npx @sentry/wizard@latest -i reactNative -p ios android
  ```
  It will add native config and a Sentry.init block. Replace the empty DSN in `src/App.tsx` or configure via build-time env.

- Use the Developer screen to toggle API v1/v2 and scenario header. The network client pushes trace IDs from the current scope or response payload.

- Demo deep link: `skipline://demo` can be wired later to run the scripted flow automatically.
