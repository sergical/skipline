## Mobile notes

- After creating the Expo app, run the Sentry wizard:
  ```bash
  cd mobile
  npx @sentry/wizard@latest -i reactNative -p ios android
  ```
  It will add native config and a Sentry.init block. Replace the empty DSN in `src/App.tsx` or configure via build-time env.

- Use the Developer screen to toggle API v1/v2 and scenario header. The network client pushes trace IDs from the current scope or response payload.

- Demo deep link: `skipline://demo` can be wired later to run the scripted flow automatically.

## Architecture Decisions

### State Management
- **Zustand** is used for global state management (cart, API configuration)
- Preferred over React Context for better performance and simpler API
- Located in `/state` directory

### Navigation
- **Expo Router** for file-based routing
- Order confirmation uses separate route with `router.replace()` to prevent back navigation
- Stack navigator configured in `app/_layout.tsx`

### Styling
- Theme-aware components using `useThemeColor` hook
- Consistent color palette across light/dark modes
- Animated components using React Native Reanimated

### Code Quality
- TypeScript for type safety
- ESLint configuration for consistent code style
- All theme colors actively used (no unused variables)
- Clean separation of concerns between components
