![Secret Scan](https://github.com/robgpm-arch/TestYourself/actions/workflows/secret-scan.yml/badge.svg)

# TestYourself - Cross-Platform Quiz Application

A comprehensive cross-platform quiz application built with React, TypeScript, and Capacitor. Deploy seamlessly across Web, Android, and iOS platforms with a unified codebase.

## Windows commits: skipping detect-secrets locally (CI enforces)

detect-secrets pre-commit can intermittently fail on Windows with “Unable to read baseline.” Use this helper for local commits; CI still runs the Linux Secret Scan workflow and blocks leaks.

```powershell
pwsh tools/commit.ps1 -m "feat: your message"
# or include other flags:
pwsh tools/commit.ps1 -m "chore: update" --signoff
```

The helper sets `SKIP=detect-secrets` only for the commit process. Secret scanning will still run in GitHub Actions.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd testyourself
npm install
```

2. **Environment Setup:**
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your Firebase configuration
nano .env
```

3. **Firebase Configuration:**
```bash
# Replace android/app/google-services.json with your Firebase config
# Get it from Firebase Console > Project Settings > General > Your apps
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Lint and format code
npm run lint
npm run format
```

## 📱 Platform Deployment

### Web Deployment
```bash
# Build and deploy
npm run build

# Deploy the dist/ folder to your hosting service
# Supports: Vercel, Netlify, Firebase Hosting, AWS S3
```

### Android Development
```bash
# Initial setup (first time only)
npx cap add android
npm run icons:generate

# Development workflow
npm run cap:android           # Build, sync, and open Android Studio
npm run android:dev           # Run on connected device/emulator

# Production builds
npm run android:build         # Build signed APK
npm run android:bundle        # Build App Bundle for Play Store
```

### iOS Development (macOS only)
```bash
# Initial setup (first time only)
npx cap add ios
npm run icons:generate

# Development workflow
npm run cap:ios              # Build, sync, and open Xcode

# Build from Xcode for App Store submission
```

## 🔧 Configuration

### Firebase Setup

1. **Create Firebase Project:**
   - Visit [Firebase Console](https://console.firebase.google.com)
   - Create new project or use existing
   - Enable Authentication, Firestore, Storage, and Cloud Messaging

2. **Web Configuration:**
   Update `.env` with your Firebase config:
   ```bash
   VITE_FIREBASE_API_KEY="your_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   # ... other Firebase config
   ```

3. **Android Configuration:**
   - Download `google-services.json` from Firebase Console
   - Replace `android/app/google-services.json`
   - Ensure package name matches: `com.testyourself.app`

### App Signing (Android)

```bash
# Generate keystore (production)
keytool -genkey -v -keystore android/keystore/testyourself-release-key.keystore -alias testyourself-key -keyalg RSA -keysize 2048 -validity 10000

# Configure signing
cp android/keystore/keystore.properties.example android/keystore/keystore.properties
# Edit with your keystore details
```

## 📁 Project Structure

```
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Screen components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and business logic
│   ├── config/            # Configuration files
│   └── types/             # TypeScript type definitions
├── android/               # Android native project
├── ios/                   # iOS native project (after setup)
├── dist/                  # Built web application
├── public/                # Static assets
└── functions/             # Firebase Cloud Functions
```

## 🛠 Development Tools

### Code Quality
```bash
npm run lint              # ESLint checking
npm run lint:fix          # Auto-fix ESLint issues
npm run format            # Format with Prettier
npm run format:check      # Check formatting
```

### Capacitor Commands
```bash
npx cap sync              # Sync web build to native projects
npx cap run android       # Run on Android device
npx cap run ios           # Run on iOS device
npx cap doctor            # Check Capacitor setup
```

## 🔐 Security & Environment Variables

**Critical:** Never commit sensitive keys to version control.

### Environment Variables
- All sensitive data should be in environment variables
- Use `.env.example` as template
- Web variables must start with `VITE_`
- Production: Set environment variables in your hosting service

### Secrets Audit
If you've accidentally committed secrets:
1. Rotate all exposed API keys immediately
2. Update `.env` and hosting environment variables
3. Remove secrets from git history: `git filter-branch` or BFG Repo-Cleaner

## 🚀 CI: Firebase Functions Deploy

This repo includes a GitHub Actions workflow at `.github/workflows/functions-deploy.yml` that deploys Cloud Functions on:

- manual trigger (workflow_dispatch)
- pushes that touch `functions/**` or `firebase.json`
- a daily schedule at 03:00 UTC (can be changed or removed)

Authenticate the deploy step by adding a `FIREBASE_TOKEN` repository secret:

1. Install Firebase CLI and login locally:
   - `npm i -g firebase-tools`
   - `firebase login`
2. Generate a CI token: `firebase login:ci` (copy the token)
3. In GitHub → your repository → Settings → Secrets and variables → Actions → New repository secret
   - Name: `FIREBASE_TOKEN`
   - Value: paste the token from step 2

The workflow will run:

- `npm --prefix functions ci`
- `npm --prefix functions run build`
- `firebase deploy --only functions --force`

To change/disable the schedule, edit `.github/workflows/functions-deploy.yml` and update/remove the `schedule:` section.

## 📊 Firebase Services

### Authentication
- Google Sign-In
- Facebook Sign-In  
- Email/Password authentication
- Anonymous authentication

### Firestore Database
- User profiles and progress
- Quiz data and results
- Real-time leaderboards
- Offline synchronization

### Cloud Storage
- User-uploaded content
- Quiz images and assets
- Profile pictures

### Cloud Messaging
- Push notifications
- Cross-platform messaging
- Background sync

## 🚀 Deployment Guide

### Web Hosting

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
# Upload dist/ folder to Netlify
```

**Firebase Hosting:**
```bash
npm run firebase:deploy
```

### Play Store (Android)

1. Build signed app bundle:
   ```bash
   npm run android:bundle
   ```

2. Upload to Google Play Console:
   - File location: `android/app/build/outputs/bundle/release/`
   - Follow Play Store submission guidelines

### App Store (iOS)

1. Open project in Xcode:
   ```bash
   npm run cap:ios
   ```

2. Build and archive in Xcode
3. Submit through Xcode Organizer

## 📚 Available Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run cap:android` | Build and open Android Studio |
| `npm run cap:ios` | Build and open Xcode |
| `npm run android:build` | Build signed Android APK |
| `npm run android:bundle` | Build Android App Bundle |
| `npm run icons:generate` | Generate app icons for all platforms |
| `npm run firebase:deploy` | Deploy to Firebase Hosting |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🐛 Troubleshooting

### Common Issues

**Build Errors:**
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors with `npm run type-check`
- Verify environment variables are set

**Android Build Issues:**
- Ensure Android Studio and SDK are installed
- Check `android/app/google-services.json` exists
- Verify package name matches Firebase configuration

**iOS Build Issues:**
- macOS with Xcode required
- Check Apple Developer account setup
- Verify iOS deployment target compatibility

**Firebase Connection:**
- Verify Firebase configuration in `.env`
- Check Firebase project permissions
- Ensure services are enabled in Firebase Console

### Performance Optimization

- Use `npm run build:prod` for optimized production builds
- Monitor bundle size with build analyzer
- Enable PWA caching for offline support
- Use image optimization for assets

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

For additional support, check the documentation in the `docs/` folder or create an issue in the repository.
