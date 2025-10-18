# Push Notifications Setup Guide

This guide covers the complete setup and implementation of push notifications for your TestYourself quiz application across web, Android, and iOS platforms.

## 🚀 Quick Start Overview

Your push notification system includes:
- **Firebase Cloud Messaging (FCM)** for cross-platform notifications
- **Service Worker** for web push notifications
- **Capacitor plugins** for native mobile notifications
- **Scheduled notifications** with Cloud Functions
- **Real-time notification management** with React components

## 📱 Platform Support

### Web (PWA)
- ✅ Push notifications via FCM
- ✅ Background notifications with service worker
- ✅ In-app notification UI
- ✅ Permission management

### Android
- ✅ Native push notifications via FCM
- ✅ Local notifications and scheduling
- ✅ Rich notifications with actions
- ✅ Notification channels and categories

### iOS
- ✅ Native push notifications via FCM
- ✅ Local notifications and scheduling
- ✅ Rich notifications with actions
- ✅ Notification permissions and settings

## 🔧 Setup Instructions

### 1. Firebase Configuration

#### Enable Cloud Messaging
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Cloud Messaging**
4. Generate VAPID key pair for web push

#### Update Environment Variables
```env
# Add to .env.local
VITE_VAPID_PUBLIC_KEY=BJhYZXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 2. Android Setup

#### Google Services Configuration
1. Download `google-services.json` from Firebase Console
2. Place in `android/app/` directory
3. Replace the example file: `android/app/google-services.json.example`

#### Verify Build Configuration
The Android app is already configured with:
- Google Services plugin
- FCM dependencies
- Notification permissions
- Capacitor push notification plugin

### 3. iOS Setup (macOS Required)

#### Add iOS App to Firebase
1. Go to Firebase Console → Project Settings
2. Add iOS app with bundle ID: `com.testyourself.app`
3. Download `GoogleService-Info.plist`
4. Add to iOS project in Xcode

#### Configure APNs
1. Create APNs certificate in Apple Developer Console
2. Upload to Firebase Console → Cloud Messaging → Apple app certificate

### 4. Web Service Worker

The service worker is already configured at:
- `public/firebase-messaging-sw.js`

Features included:
- Background message handling
- Notification display with actions
- Click handling and navigation
- Notification analytics tracking

## 🎯 Usage Examples

### Basic Notification Service

```typescript
import { NotificationService } from './services/notificationService';

// Initialize (call once on app start)
await NotificationService.initialize();

// Request permission
const permission = await NotificationService.requestPermission();

// Send local notification
await NotificationService.sendLocalNotification({
  title: 'Quiz Reminder',
  body: 'Time to take your math quiz!',
  data: { quizId: '123' }
});

// Schedule notification
await NotificationService.scheduleNotification({
  id: 1,
  title: 'Study Reminder',
  body: 'Keep up your learning streak!',
  schedule: { at: new Date(Date.now() + 60000) } // 1 minute from now
});
```

### React Hook Usage

```typescript
import { useNotifications } from './hooks/useNotifications';

const MyComponent = () => {
  const {
    permission,
    settings,
    requestPermission,
    scheduleQuizReminder,
    sendAchievementNotification
  } = useNotifications();

  const handleQuizSchedule = async () => {
    const reminderTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    await scheduleQuizReminder('quiz123', 'Math Quiz', reminderTime);
  };

  return (
    <div>
      {!permission.granted && (
        <button onClick={requestPermission}>
          Enable Notifications
        </button>
      )}
    </div>
  );
};
```

### Notification Manager Component

```typescript
import { NotificationManager } from './components/NotificationManager';

const App = () => (
  <div>
    <header>
      <NotificationManager className="ml-auto" />
    </header>
    {/* Rest of your app */}
  </div>
);
```

## 🛠️ Features

### Notification Types

1. **Quiz Reminders**
   - Scheduled reminders for upcoming quizzes
   - Deep linking to specific quiz
   - Customizable frequency

2. **Achievement Notifications**
   - Instant notifications for unlocked achievements
   - Rich notifications with achievement details
   - Navigation to achievement page

3. **Study Reminders**
   - Daily/weekly study streak reminders
   - Personalized based on user activity
   - Quiet hours support

4. **Leaderboard Updates**
   - Position changes in leaderboards
   - Competition-based notifications
   - Social engagement features

### Advanced Features

#### Permission Management
```typescript
// Check current permission status
const status = await NotificationService.getNotificationSettings();

// Request permission with custom handling
const permission = await NotificationService.requestPermission();
if (permission.denied) {
  // Show custom UI to guide user to settings
}
```

#### Scheduled Notifications
```typescript
// Schedule recurring study reminders
await NotificationService.scheduleNotification({
  id: 100,
  title: 'Daily Study Time',
  body: 'Time for your daily learning session!',
  schedule: {
    at: new Date('2024-01-15T09:00:00'),
    repeats: true,
    every: 'day'
  }
});

// Cancel scheduled notification
await NotificationService.cancelScheduledNotification(100);
```

#### Rich Notifications
```typescript
await NotificationService.sendLocalNotification({
  title: 'Quiz Complete! 🎉',
  body: 'You scored 95% on Math Quiz',
  image: '/images/achievement-badge.png',
  actions: [
    { action: 'view_results', title: 'View Results' },
    { action: 'share', title: 'Share Score' }
  ],
  requireInteraction: true
});
```

## 🔐 Security & Privacy

### Permission Handling
- Progressive permission requests
- Clear explanation of notification benefits
- Easy opt-out mechanisms
- Respect user preferences

### Data Privacy
- FCM tokens stored securely in Firestore
- User notification preferences encrypted
- No sensitive data in notification payloads
- GDPR compliance ready

### Security Rules
```javascript
// Firestore security rules for notifications
match /notifications/{notificationId} {
  allow read: if request.auth != null && 
                 request.auth.uid == resource.data.userId;
  allow write: if false; // Only Cloud Functions can write
}
```

## 📊 Analytics & Tracking

### Built-in Analytics
- Notification delivery rates
- Click-through rates
- Permission grant/deny rates
- User engagement patterns

### Custom Event Tracking
```typescript
// Automatic tracking included for:
- notification_permission_granted
- notification_received
- notification_clicked
- notification_dismissed
- scheduled_notification_created
```

## 🚨 Troubleshooting

### Common Issues

1. **Notifications Not Received**
   - Check FCM token registration
   - Verify Firebase project configuration
   - Test notification permissions
   - Check device notification settings

2. **Service Worker Issues**
   - Verify service worker registration
   - Check browser developer tools
   - Clear browser cache and storage
   - Test in incognito mode

3. **Android Build Issues**
   - Ensure `google-services.json` is present
   - Check Google Services plugin configuration
   - Verify package name matches Firebase config
   - Clean and rebuild project

4. **iOS Issues**
   - Verify `GoogleService-Info.plist` is added
   - Check APNs certificate configuration
   - Test on physical device (not simulator)
   - Verify bundle ID matches Firebase config

### Debug Commands

```bash
# Test web notifications in browser console
NotificationService.testNotification();

# Check notification settings
console.log(await NotificationService.getNotificationSettings());

# View pending scheduled notifications
console.log(await NotificationService.getPendingNotifications());
```

## 🔄 Cloud Functions Integration

### Scheduled Notification Processing
```typescript
// Cloud Function runs every minute to process scheduled notifications
export const processScheduledNotifications = onCall(async (request) => {
  // Processes due notifications and reschedules recurring ones
});
```

### Push Notification Sending
```typescript
// Send targeted push notifications
export const sendPushNotification = onCall(async (request) => {
  // Sends FCM messages to specific users
});
```

## 🚀 Deployment

### Web Deployment
1. Ensure service worker is in public directory
2. Configure VAPID keys in environment
3. Deploy to hosting platform

### Mobile Deployment
1. Configure Firebase project for each platform
2. Add platform-specific configuration files
3. Build and test notifications on devices
4. Submit to app stores with notification permissions

## 📈 Best Practices

### User Experience
- Request permissions contextually
- Provide clear value proposition
- Respect quiet hours and user preferences
- Use meaningful notification content

### Technical Implementation
- Implement proper error handling
- Use analytics to track effectiveness
- Test across all supported platforms
- Monitor notification delivery rates

### Compliance
- Follow platform notification guidelines
- Implement proper privacy controls
- Provide easy unsubscribe options
- Document data collection practices

## 🔗 Related Documentation

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)