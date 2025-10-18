# Firebase Backend Setup Guide

This guide will help you set up Firebase as the backend for your TestYourself quiz application.

## 🚀 Quick Start

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `testyourself-quiz-app`
4. Enable Google Analytics (recommended)
5. Choose or create Analytics account

### 2. Configure Firebase Services

#### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - Email/Password
   - Google
   - Facebook (optional)

#### Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (we'll apply security rules later)
4. Select a location close to your users

#### Storage
1. Go to **Storage**
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as Firestore

#### Hosting (Optional)
1. Go to **Hosting**
2. Click "Get started"
3. Follow the setup instructions

### 3. Get Configuration Keys

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > Web app
4. Register app name: `TestYourself Web`
5. Copy the config object

### 4. Update Environment Variables

1. Copy `.env.example` to `.env`
2. Replace the placeholder values with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCD123456
VITE_VAPID_PUBLIC_KEY=your_web_push_key
```

> After updating the `.env`, restart `npm run dev` or rerun `npm run build` so Vite reloads the new configuration.

## 📚 Firebase Services Overview

### Authentication Service (`src/services/authService.ts`)
- Email/password authentication
- Social login (Google, Facebook)
- User profile management
- Password reset functionality

### Database Service (`src/services/databaseService.ts`)
- Quiz management (CRUD operations)
- User stats and progress tracking
- Leaderboard management
- Real-time subscriptions

### Storage Service (`src/services/storageService.ts`)
- File upload with progress tracking
- Image compression
- User profile pictures
- Quiz media files

### Analytics Service (`src/services/analyticsService.ts`)
- User behavior tracking
- Quiz performance analytics
- Conversion tracking
- Custom event logging

### Cloud Functions (`functions/src/index.ts`)
- Server-side quiz result calculation
- Automatic user stats updates
- Leaderboard maintenance
- Payment processing
- Push notifications

## 🛠️ Development Workflow

### Local Development with Emulators

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase project:
```bash
firebase init
```
Select:
- Firestore
- Functions
- Hosting (optional)
- Storage
- Emulators

4. Start emulators:
```bash
firebase emulators:start
```

5. Update `.env.local` for local development:
```env
# Add these for local development
VITE_USE_FIREBASE_EMULATORS=true
VITE_FIREBASE_AUTH_DOMAIN=localhost
```

### Deploy Cloud Functions

1. Install dependencies:
```bash
cd functions
npm install
```

2. Build and deploy:
```bash
npm run build
firebase deploy --only functions
```

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Deploy to Hosting

```bash
npm run build
firebase deploy --only hosting
```

## 🔐 Security Configuration

### Firestore Security Rules
The `firestore.rules` file contains comprehensive security rules:
- Users can only access their own data
- Public quizzes are readable by authenticated users
- Premium content requires valid subscription
- Rate limiting and input validation

### Storage Security Rules
The `storage.rules` file controls file access:
- User profile images (5MB limit)
- Quiz media files (50MB limit)
- Study materials with subscription checks
- File type validation

## 📊 Database Structure

### Collections

#### Users (`/users/{userId}`)
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  profile: UserProfile,
  stats: UserStats,
  subscription: UserSubscription,
  preferences: UserPreferences
}
```

#### Quizzes (`/quizzes/{quizId}`)
```javascript
{
  title: string,
  subject: string,
  questions: Question[],
  difficulty: 'easy' | 'medium' | 'hard',
  isPublic: boolean,
  createdBy: string
}
```

#### Quiz Attempts (`/quiz_attempts/{attemptId}`)
```javascript
{
  quizId: string,
  userId: string,
  score: number,
  answers: UserAnswer[],
  status: 'completed' | 'in-progress'
}
```

### Indexes
Key database indexes are defined in `firestore.indexes.json` for optimal query performance.

## 🚨 Production Checklist

### Before Going Live

1. **Update Security Rules**
   - Review and test Firestore rules
   - Verify Storage rules
   - Enable authentication requirements

2. **Environment Configuration**
   - Create production environment variables
   - Set up proper CORS settings
   - Configure custom domain (optional)

3. **Performance Optimization**
   - Enable Firestore indexes
   - Set up CDN for static assets
   - Configure caching headers

4. **Monitoring and Analytics**
   - Enable Firebase Performance Monitoring
   - Set up Crashlytics for error tracking
   - Configure Analytics goals and conversions

5. **Backup and Recovery**
   - Set up automated Firestore backups
   - Test data recovery procedures
   - Document incident response plan

### Pricing Considerations

- **Firestore**: Pay per read/write operation
- **Authentication**: Free up to 10,000 users/month
- **Storage**: Pay per GB stored and downloaded
- **Functions**: Pay per invocation and compute time
- **Hosting**: 10GB free, then pay per GB

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure proper domain configuration in Firebase Console
   - Check authentication domain settings

2. **Permission Denied Errors**
   - Verify security rules
   - Check user authentication status
   - Review Firestore permissions

3. **Function Timeout Errors**
   - Increase timeout settings
   - Optimize function code
   - Consider using Firestore triggers

4. **Storage Upload Failures**
   - Check file size limits
   - Verify file type restrictions
   - Review storage security rules

### Debugging Tips

1. Use Firebase Emulators for local testing
2. Enable debug mode in Firebase SDK
3. Check browser console for detailed errors
4. Use Firebase Console logs for function debugging

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)