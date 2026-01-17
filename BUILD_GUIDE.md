# Mahila Mandal Directory App

## Building the App

### Prerequisites
- Node.js installed
- Expo account (sign up at expo.dev)

### Steps to Build APK

1. **Install EAS CLI globally**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account**
   ```bash
   eas login
   ```

3. **Configure the project**
   ```bash
   eas build:configure
   ```
   This will generate a project ID and update app.json automatically.

4. **Build APK for Android**
   
   For preview/testing (faster):
   ```bash
   eas build --platform android --profile preview
   ```
   
   For production:
   ```bash
   eas build --platform android --profile production
   ```

5. **Download and Install**
   - After build completes (10-20 minutes), you'll get a download link
   - Download the APK file
   - Transfer to your Android device
   - Enable "Install from Unknown Sources" in device settings
   - Install the APK

### Alternative: Local Build

If you want to build locally without EAS:

1. **Prebuild the project**
   ```bash
   npx expo prebuild
   ```

2. **Build with Android Studio**
   - Open the `android` folder in Android Studio
   - Click Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK will be in `android/app/build/outputs/apk/`

### Testing the App

To test before building:
```bash
npm start
# Then scan QR code with Expo Go app
```

## Features
- 486 member directory
- QR code generation and scanning
- Search by name and phone
- 52 cooking groups with captains
- Call and email integration
- Beautiful animated splash screen
