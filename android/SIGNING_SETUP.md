# Android App Signing Setup for Google Play Store

This guide walks you through setting up app signing for Google Play Store release.

## Prerequisites

- Android Studio or JDK installed (for keytool command)
- Access to command line/terminal

## Step 1: Generate a Release Keystore

### Option A: Using Command Line (keytool)

```bash
# Navigate to the keystore directory
cd android/keystore

# Generate a new keystore file
keytool -genkey -v -keystore testyourself-release-key.keystore -alias testyourself-key -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password (remember this!)
# - Key password (remember this!)
# - Your name and organization details
```

### Option B: Using Android Studio

1. Open Android Studio
2. Go to **Build** → **Generate Signed Bundle / APK**
3. Choose **Android App Bundle**
4. Click **Create new keystore**
5. Save it as `android/keystore/testyourself-release-key.keystore`
6. Fill in the required information and remember your passwords

## Step 2: Configure Keystore Properties

1. Copy the example file:
   ```bash
   cp android/keystore/keystore.properties.example android/keystore/keystore.properties
   ```

2. Edit `android/keystore/keystore.properties` with your actual values:
   ```properties
   storePassword=YOUR_ACTUAL_STORE_PASSWORD
   keyPassword=YOUR_ACTUAL_KEY_PASSWORD
   keyAlias=testyourself-key
   storeFile=../keystore/testyourself-release-key.keystore
   ```

## Step 3: Build Release APK/AAB

### Build Android App Bundle (AAB) - Recommended for Play Store

```bash
# Build the web app first
npm run build

# Sync with Android
npx cap sync android

# Open Android Studio and build AAB
npx cap open android

# In Android Studio:
# 1. Go to Build → Generate Signed Bundle / APK
# 2. Choose Android App Bundle
# 3. Select your keystore file
# 4. Build release AAB
```

### Build APK (Alternative)

```bash
# Using Gradle directly
cd android
./gradlew assembleRelease

# The signed APK will be in:
# android/app/build/outputs/apk/release/app-release.apk
```

## Step 4: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select existing app
3. Upload your AAB file to the release track
4. Fill in app details, screenshots, and descriptions
5. Submit for review

## Important Security Notes

⚠️ **NEVER commit your keystore file or keystore.properties to version control!**

- The keystore file contains your app's signing certificate
- If lost, you cannot update your app on Google Play Store
- Keep secure backups of both the keystore file and passwords
- The `android/keystore/.gitignore` file prevents accidental commits

## Backup Your Keystore

```bash
# Create a secure backup
cp android/keystore/testyourself-release-key.keystore ~/secure-backups/
# Also backup your keystore.properties file
```

## Troubleshooting

### "Keystore file not found" error
- Check that the `storeFile` path in `keystore.properties` is correct
- Ensure the keystore file exists in the specified location

### "Wrong password" error
- Verify your `storePassword` and `keyPassword` in `keystore.properties`
- Passwords are case-sensitive

### Build fails with signing errors
- Ensure `keystore.properties` file exists in `android/keystore/`
- Check that all properties are correctly set
- Try building a debug version first to isolate signing issues

## Play Store Requirements

- **Target SDK**: Keep updated to latest Android API level
- **App Bundle**: Use AAB format (smaller downloads, better optimization)
- **64-bit**: Ensure your app supports 64-bit architectures
- **Permissions**: Review and minimize requested permissions

## Additional Resources

- [Android App Signing Documentation](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Capacitor Android Deployment Guide](https://capacitorjs.com/docs/android/deploying)