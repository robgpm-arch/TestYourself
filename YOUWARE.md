# YOUWARE.md - Cross-Platform Quiz Application

This file provides guidance to YOUWARE Agent (youware.com) when working with this cross-platform React application.

## Project Overview

**TestYourself** is a comprehensive cross-platform quiz application built with React, TypeScript, and modern web technologies. The application provides a unified codebase that works seamlessly across **Web**, **Android**, and **iOS** platforms.

### Core Architecture

- **Project Type**: React + TypeScript + Vite Cross-Platform Application
- **Entry Point**: `src/main.tsx` (React application entry)
- **Build System**: Vite 7.0.0 with production-ready builds
- **Styling System**: Tailwind CSS 3.4.17 with mobile-first design
- **Cross-Platform Strategy**: Progressive Web App + Capacitor for native mobile deployment

## Cross-Platform Implementation Strategy

### Platform Support Matrix
- **Web Browser**: Full-featured responsive web application
- **Progressive Web App**: Installable web app with offline capabilities
- **Android**: Native app deployment via Capacitor
- **iOS**: Native app deployment via Capacitor (requires macOS)

### Technology Stack for Cross-Platform Development

#### Core Framework
- **React 18.3.1**: Modern React with concurrent features and hooks
- **TypeScript 5.8.3**: Type-safe development with strict typing
- **Vite 7.0.0**: Fast build tool optimized for modern web development

#### Routing and Navigation
- **React Router DOM 6.30.1**: Client-side routing with cross-platform navigation
- **Custom Navigation Components**: Responsive navigation adapted for each platform

#### State Management
- **Zustand 4.4.7**: Lightweight, scalable state management
- **React Hooks**: Built-in state management for local component state

#### UI and Responsive Design
- **Tailwind CSS 3.4.17**: Mobile-first utility-based styling
- **Framer Motion 11.0.8**: Smooth animations and micro-interactions
- **Custom Responsive Components**: Adaptive layouts for all screen sizes

#### Mobile and PWA Features
- **Service Worker**: Offline support and intelligent caching
- **PWA Manifest**: App-like installation experience
- **Touch Gestures**: Custom hooks for native touch interactions
- **Device Detection**: Automatic platform and screen size detection
- **Capacitor Ready**: Native mobile deployment configuration

## Project Structure and Organization

### Component Architecture
```
src/
├── components/             # Reusable cross-platform UI components
│   ├── Layout.tsx         # Main layout wrapper with responsive navigation
│   ├── Card.tsx           # Flexible card component for content display
│   ├── Button.tsx         # Interactive button with touch optimization
│   ├── Input.tsx          # Form input with mobile-friendly design
│   ├── Modal.tsx          # Modal dialog with gesture support
│   └── ResponsiveGrid.tsx # Grid system for adaptive layouts
├── pages/                 # Screen components for different app sections
│   ├── Home.tsx          # Dashboard with personalized content
│   ├── Profile.tsx       # User profile with achievement system
│   ├── Settings.tsx      # Comprehensive settings and preferences
│   ├── LoginSignup.tsx   # Authentication with social integration
│   └── SplashScreen.tsx  # Welcome screen with animations
├── hooks/                # Custom hooks for cross-platform functionality
│   ├── useTouchGestures.ts     # Touch and gesture handling
│   └── useDeviceDetection.ts   # Platform and breakpoint detection
└── assets/              # Static resources optimized for all platforms
```

### Cross-Platform Asset Management
- **Logo and Branding**: Optimized for web, PWA, and native app icons
- **Images**: Responsive images with appropriate sizing for different devices
- **Build Output**: Production-ready assets in `dist/` directory

## Development Workflow

### Essential Commands
```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Production build (required for mobile deployment)
npm run build

# Preview production build
npm run preview

# Capacitor commands for mobile development
npx cap sync android          # Sync web build to Android
npx cap open android          # Open Android project in Android Studio
npx cap run android           # Build and run on Android device/emulator
npx cap sync ios              # Sync web build to iOS (macOS only)
npx cap open ios              # Open iOS project in Xcode (macOS only)

# Asset generation for mobile apps
npx @capacitor/assets generate    # Generate all platform icons and splash screens

# Android release builds
cd android && ./gradlew assembleRelease    # Build signed release APK
cd android && ./gradlew bundleRelease      # Build signed release AAB for Play Store
```

### Build Requirements
- **MANDATORY**: Always run `npm run build` after code changes
- **Verification**: Successful build completion indicates cross-platform readiness
- **Asset Paths**: All assets use absolute paths (e.g., `/assets/logo.png`) for build compatibility

## Cross-Platform Deployment Guide

### Web Deployment
The built application in `dist/` folder can be deployed to:
- Static hosting services (Vercel, Netlify, GitHub Pages)
- Cloud storage (AWS S3, Google Cloud Storage)
- Traditional web servers with proper routing configuration

### PWA Installation
Users can install the web app directly:
1. Visit application URL in supported browsers
2. Look for "Install App" prompt or browser menu option
3. App installs and behaves like a native application

### Mobile App Development

#### Android Deployment
```bash
# Install Capacitor CLI (if not installed)
npm install -g @capacitor/cli

# Add Android platform
npx cap add android

# Build web app and sync to Android
npm run build
npx cap sync android

# Open in Android Studio for final build
npx cap open android
```

#### Android App Signing for Play Store
```bash
# Generate release keystore (one-time setup)
keytool -genkey -v -keystore android/keystore/testyourself-release-key.keystore -alias testyourself-key -keyalg RSA -keysize 2048 -validity 10000

# Configure keystore properties
cp android/keystore/keystore.properties.example android/keystore/keystore.properties
# Edit keystore.properties with your actual values

# Build signed release
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

#### iOS Deployment (macOS Required)
```bash
# Add iOS platform
npx cap add ios

# Build and sync to iOS
npm run build  
npx cap sync ios

# Open in Xcode for final build
npx cap open ios
```

## Design System and Responsive Behavior

### Responsive Breakpoints
- **xs**: < 480px (Small mobile devices)
- **sm**: 480px - 768px (Mobile devices)
- **md**: 768px - 1024px (Tablets)
- **lg**: 1024px - 1280px (Small desktops)
- **xl**: 1280px - 1536px (Large desktops)
- **2xl**: > 1536px (Ultra-wide screens)

### Mobile-First Design Principles
- **Touch Targets**: Minimum 44px touch targets for mobile usability
- **Navigation**: Responsive navigation that adapts to screen size
- **Typography**: Scalable font sizes with proper contrast ratios
- **Spacing**: Consistent spacing system optimized for touch interfaces

### Platform-Specific Adaptations
- **Web**: Full-featured interface with hover states and mouse interactions
- **Mobile**: Touch-optimized interface with gesture support
- **Tablet**: Optimized layouts taking advantage of larger screen real estate

## Key Features and Functionality

### Authentication System
- **Login/Signup**: Social media integration ready (Google, Facebook)
- **Form Validation**: Client-side validation with error handling
- **State Management**: Secure authentication state across app

### User Interface Components
- **Dashboard**: Personalized home screen with progress tracking
- **Profile Management**: User profiles with achievement system
- **Settings**: Comprehensive preference and privacy controls
- **Responsive Cards**: Flexible content display components
- **Modal System**: Overlay dialogs with gesture dismissal

### Progressive Web App Features
- **Offline Support**: Service Worker with intelligent caching strategy
- **Push Notifications**: Cross-platform notification system
- **App Manifest**: Native app-like installation experience
- **Background Sync**: Data synchronization when connection is restored

### Touch and Gesture Support
- **Swipe Gestures**: Navigation through swipe interactions
- **Pinch to Zoom**: Scale interactions where appropriate
- **Tap Handling**: Single and double tap gesture recognition
- **Touch Feedback**: Visual and haptic feedback for interactions

## Performance Optimization

### Build Optimization
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and resource compression
- **Bundle Analysis**: Monitoring bundle size and dependencies

### Runtime Performance
- **Lazy Loading**: Components and routes loaded on demand
- **Memoization**: React.memo and useMemo for performance
- **Virtual Scrolling**: Efficient handling of large lists
- **Image Optimization**: Responsive images with proper loading strategies

## Development Guidelines

### Code Standards
- **TypeScript**: Strict typing with comprehensive interfaces
- **Component Patterns**: Functional components with hooks
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Accessibility**: WCAG compliant components and interactions

### Cross-Platform Considerations
- **Asset Paths**: Use absolute paths starting with `/` for all static resources
- **Touch Interactions**: Design for both mouse and touch inputs
- **Performance**: Optimize for mobile device capabilities
- **Network**: Handle offline scenarios gracefully

### Testing Strategy
- **Responsive Testing**: Verify layouts across all breakpoints
- **Touch Testing**: Validate gesture interactions on touch devices
- **Performance Testing**: Monitor build sizes and runtime performance
- **Cross-Browser Testing**: Ensure compatibility across target browsers

## Troubleshooting and Common Issues

### Build Issues
- **Asset Loading**: Ensure all asset paths use absolute paths (`/assets/`)
- **TypeScript Errors**: Resolve all type errors before production build
- **Dependency Issues**: Run `npm install` to resolve missing dependencies

### Mobile Deployment
- **Android**: Ensure Android Studio and SDK are properly configured
- **iOS**: Requires macOS with Xcode for iOS development
- **Permissions**: Configure app permissions in Capacitor configuration

### Performance Issues
- **Bundle Size**: Monitor and optimize large dependencies
- **Memory Usage**: Profile components for memory leaks
- **Animation Performance**: Use hardware acceleration for smooth animations

## Admin Catalog Management

### Firestore Collections
The admin experience manages hierarchical catalog content stored in Firestore. Collections are defined in `src/types/firebase.ts` and aligned with CRUD helpers in `src/services/adminCatalogService.ts`.

| Collection | Purpose | Key fields |
| --- | --- | --- |
| `mediums` | Language/medium metadata | `name`, `code`, `locale`, `order`, `isVisible`, audit fields |
| `boards` | Education boards linked to mediums | `mediumId`, `name`, `region`, `code`, `order`, visibility/audit |
| `courses` | Course tracks tied to boards/mediums | `boardId`, `mediumId`, `name`, `slug`, `level`, `thumbnail`, ordering |
| `subjects` | Subjects under courses | `courseId`, `name`, `icon`, `color`, ordering |
| `chapters` | Chapter progression for subjects | `subjectId`, `chapterNumber`, `durationMinutes`, `prerequisites`, ordering |
| `quiz_sets` | Assessments mapped to chapters | `chapterId`, `difficulty`, `totalQuestions`, `durationMinutes`, `tags`, publish metadata |
| `screens` | App navigation/feature flags | `path`, `category`, `roles`, ordering, visibility |
| `leaderboard_configs` | Leaderboard definitions | `period`, `metric`, `subject`, `limit`, visibility |

All catalog documents include `isVisible`, `order`, and audit metadata (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`). Firestore security rules must ensure only admin roles can mutate these collections.

### AdminDashboard (`src/pages/AdminDashboard.tsx`)
- Real-time subscriptions update each catalog list using `AdminCatalogService.subscribeToCollection`.
- Parent-child filters (medium → board → course → subject → chapter) drive the visible items.
- CRUD flows share a dynamic form schema; fields are defined per tab and converted to Firestore payloads in `buildPayload`.
- Visibility toggles and duplication rely on helper methods in `AdminCatalogService`.
- Form submissions require a signed-in admin (the Firebase Auth user ID is captured via `auth.currentUser`). Ensure backend security rules verify `request.auth.token.admin` or equivalent.

### AdminCatalogService (`src/services/adminCatalogService.ts`)
- Wraps Firestore CRUD with audit metadata helpers (`withAuditMetadata`, `withUpdateMetadata`).
- `subscribeToCollection` provides live updates with safe fallbacks if queries fail.
- `buildRelationshipConstraint` helps compose filtered queries when you need dependent collections.
- Duplication increments `order` and appends "(Copy)" to the name. Adjust logic if naming collisions need stricter handling.

### Admin UX Considerations
- Prerequisite checks prevent creating child entities before parents exist; adjust `PREREQUISITE_MESSAGES` if rules change.
- Filter state resets cascade when a parent filter changes via the dedicated `handle*FilterChange` callbacks.
- Chunk-size warnings during build stem from large shared bundles (see build output). Consider route-based code splitting if the admin grows further.

## Firebase Configuration
- Runtime configuration is sourced from `src/config/firebase.ts` using `VITE_FIREBASE_*` env vars with hard-coded fallbacks. Replace placeholders for production.
- Ensure Firestore rules allow read/write only for authorised admins on catalog collections.
- Push notification token persistence is intentionally deferred—`NotificationService.saveFCMToken` now logs a warning and must be completed via a secure backend worker.

## Build Observations
- `npm run build` (Vite) completes in ~16s; current JS bundle exceeds 1 MB post-minification. Monitor bundle size and consider manual chunking (`build.rollupOptions.output.manualChunks`) if performance becomes an issue.

## Future Enhancement Opportunities

### Advanced Features
- **Real-time Multiplayer**: WebSocket integration for live competitions
- **AI Integration**: Adaptive difficulty and personalized recommendations
- **Analytics**: User behavior tracking and performance insights
- **Social Features**: Friend systems, leaderboards, and sharing

### Platform Extensions
- **Desktop Apps**: Electron wrapper for desktop deployment
- **Smart TV**: TV-optimized interface for living room experience
- **Wearables**: Companion apps for smartwatches
- **Voice Integration**: Voice commands and audio interactions

This cross-platform architecture provides a solid foundation for modern app development that reaches users across all their devices with a consistent, high-quality experience.