## Sentry CLI and wizards

- Install CLI
  ```bash
  npm i -g @sentry/cli-binary
  # or via brew
  brew install getsentry/tools/sentry-cli
  ```

- Configure auth
  ```bash
  sentry-cli login
  ```

- Run backend wizard (adds config suggestions)
  ```bash
  sentry-cli wizard -i python
  ```

- Run React Native wizard in `mobile/`
  ```bash
  npx @sentry/wizard@latest -i reactNative -p ios android
  ```

- Optional: create a release for the video demo
  ```bash
  export SENTRY_ORG=your-org
  export SENTRY_PROJECT=skipline
  sentry-cli releases new skipline@1.0.0
  sentry-cli releases set-commits --auto skipline@1.0.0
  sentry-cli releases finalize skipline@1.0.0
  ```
