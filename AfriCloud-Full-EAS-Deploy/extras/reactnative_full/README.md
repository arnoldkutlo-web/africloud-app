
AfriCloud Mobile (Full RN) - Android implementation

This scaffold uses react-native-blob-util to stream file slices and upload via S3 multipart presigned URLs.

Prerequisites:
- Node, Java JDK, Android SDK, Android Studio configured
- Android device/emulator
- For EAS/Expo builds: EAS CLI and account, or use standard react-native CLI builds

Install:
  cd extras/reactnative_full
  npm install
  npx pod-install ios   # if building iOS on macOS

Run on Android (dev):
  npx react-native run-android

Build signed APK (React Native CLI):
  1. Generate signing key and add to android/app/* as usual
  2. ./gradlew assembleRelease

Build with EAS (recommended for CI):
  1. Install EAS CLI: npm install -g eas-cli
  2. Configure eas.json and login
  3. Run: eas build -p android --profile production
  4. EAS will produce an APK/AAB you can download

CI (GitHub Actions):
- A workflow is included at .github/workflows/rn-eas-build.yml that will:
  - Install dependencies
  - Use EAS CLI with EAS_TOKEN secret to trigger a build
  - Upload build artifact to workflow artifacts

Secrets needed for CI:
- EAS_TOKEN (Expo Application Services token)
- ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD (if using local gradle signing)

Notes:
- The code provided handles reading file slices as base64 and uploading via PUT. On some Android setups you may prefer streaming with native modules for performance.
- ETag handling: the implementation attempts to read ETag from response headers. Some S3-compatible providers may return ETag differently; test and adjust accordingly.
