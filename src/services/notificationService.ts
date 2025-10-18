import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { PushNotifications, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { messaging } from '../config/firebase';
import { AnalyticsService } from './analyticsService';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface ScheduledNotification {
  id: number;
  title: string;
  body: string;
  schedule: {
    at?: Date;
    repeats?: boolean;
    every?: 'year' | 'month' | 'two-weeks' | 'week' | 'day' | 'hour' | 'minute' | 'second';
  };
  data?: Record<string, any>;
}

export class NotificationService {
  private static fcmToken: string | null = null;
  private static isInitialized = false;

  /**
   * Initialize notification service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await this.initializeNativeNotifications();
      } else {
        await this.initializeWebNotifications();
      }
      
      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  /**
   * Initialize web notifications (PWA)
   */
  private static async initializeWebNotifications(): Promise<void> {
    if (!messaging) {
      console.warn('Firebase messaging not available');
      return;
    }

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service worker registered:', registration);
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }

    // Request permission and get token
    await this.requestPermission();

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      this.handleForegroundMessage(payload);
    });
  }

  /**
   * Initialize native notifications (iOS/Android)
   */
  private static async initializeNativeNotifications(): Promise<void> {
    // Request permission
    await this.requestNativePermission();

    // Register for push notifications
    await PushNotifications.register();

    // Handle registration
    PushNotifications.addListener('registration', (token) => {
      console.log('Native push registration success, token:', token.value);
      this.fcmToken = token.value;
      this.saveFCMToken(token.value);
    });

    // Handle registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Native push registration error:', error);
    });

    // Handle received notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      this.handleNativeNotificationReceived(notification);
    });

    // Handle notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      this.handleNativeNotificationAction(notification);
    });

    // Initialize local notifications
    await this.initializeLocalNotifications();
  }

  /**
   * Initialize local notifications
   */
  private static async initializeLocalNotifications(): Promise<void> {
    // Request permission for local notifications
    const permission = await LocalNotifications.requestPermissions();
    
    if (permission.display !== 'granted') {
      console.warn('Local notification permission not granted');
      return;
    }

    // Handle local notification actions
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Local notification action performed:', notification);
      this.handleLocalNotificationAction(notification);
    });
  }

  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (Capacitor.isNativePlatform()) {
      return this.requestNativePermission();
    } else {
      return this.requestWebPermission();
    }
  }

  /**
   * Request web notification permission
   */
  private static async requestWebPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return { granted: false, denied: true, prompt: false };
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    const result = {
      granted: permission === 'granted',
      denied: permission === 'denied',
      prompt: permission === 'default'
    };

    if (result.granted && messaging) {
      await this.getFCMToken();
    }

    return result;
  }

  /**
   * Request native notification permission
   */
  private static async requestNativePermission(): Promise<NotificationPermission> {
    const permission = await PushNotifications.requestPermissions();
    
    return {
      granted: permission.receive === 'granted',
      denied: permission.receive === 'denied',
      prompt: permission.receive === 'prompt'
    };
  }

  /**
   * Get FCM token for web
   */
  private static async getFCMToken(): Promise<string | null> {
    if (!messaging) return null;

    try {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
      });
      
      if (token) {
        console.log('FCM token generated:', token);
        this.fcmToken = token;
        await this.saveFCMToken(token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to database
   */
  private static async saveFCMToken(token: string): Promise<void> {
    try {
      // Save token to user's profile in Firestore
      // This will be used by Cloud Functions to send targeted notifications
      // The Admin interface should manage catalog data only; token persistence must be implemented in the backend.
      console.warn('FCM token retrieved. Persist this token via a secure backend workflow.');
      // TODO: Implement backend endpoint to store notification tokens associated with authenticated users.

      // Track token registration
      AnalyticsService.trackCustomEvent({
        name: 'notification_token_registered',
        parameters: {
          platform: Capacitor.getPlatform(),
          token_length: token.length
        }
      });
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  /**
   * Send local notification
   */
  static async sendLocalNotification(notification: NotificationPayload): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.sendNativeLocalNotification(notification);
    } else {
      await this.sendWebNotification(notification);
    }
  }

  /**
   * Send web notification
   */
  private static async sendWebNotification(notification: NotificationPayload): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('Web notifications not available or not permitted');
      return;
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192.webp',
      badge: '/icons/icon-96.webp',
      image: notification.image,
      data: notification.data,
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      silent: notification.silent,
      actions: notification.actions?.map(action => ({
        action: action.action,
        title: action.title,
        icon: action.icon
      }))
    };

    const webNotification = new Notification(notification.title, options);

    webNotification.onclick = () => {
      console.log('Notification clicked');
      this.handleNotificationClick(notification.data);
      webNotification.close();
    };

    // Auto close after 5 seconds if not requiring interaction
    if (!notification.requireInteraction) {
      setTimeout(() => {
        webNotification.close();
      }, 5000);
    }
  }

  /**
   * Send native local notification
   */
  private static async sendNativeLocalNotification(notification: NotificationPayload): Promise<void> {
    const localNotification: LocalNotificationSchema = {
      title: notification.title,
      body: notification.body,
      id: Date.now(),
      sound: 'default',
      attachments: notification.image ? [{ id: 'image', url: notification.image }] : undefined,
      actionTypeId: 'GENERAL',
      extra: notification.data
    };

    await LocalNotifications.schedule({
      notifications: [localNotification]
    });
  }

  /**
   * Schedule notification
   */
  static async scheduleNotification(notification: ScheduledNotification): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Scheduled notifications only available on native platforms');
      return;
    }

    const scheduledNotification: LocalNotificationSchema = {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      schedule: notification.schedule,
      sound: 'default',
      extra: notification.data
    };

    await LocalNotifications.schedule({
      notifications: [scheduledNotification]
    });

    console.log('Notification scheduled:', notification);
  }

  /**
   * Cancel scheduled notification
   */
  static async cancelScheduledNotification(id: number): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    await LocalNotifications.cancel({
      notifications: [{ id: id.toString() }]
    });
  }

  /**
   * Get pending notifications
   */
  static async getPendingNotifications(): Promise<any[]> {
    if (!Capacitor.isNativePlatform()) return [];

    const result = await LocalNotifications.getPending();
    return result.notifications;
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.removeAllDeliveredNotifications();
    }
  }

  /**
   * Handle foreground message (web)
   */
  private static handleForegroundMessage(payload: any): void {
    console.log('Handling foreground message:', payload);

    // Show custom in-app notification
    this.showInAppNotification({
      title: payload.notification?.title || 'New Notification',
      body: payload.notification?.body || '',
      data: payload.data
    });

    // Track notification received
    AnalyticsService.trackCustomEvent({
      name: 'notification_received_foreground',
      parameters: {
        notification_type: payload.data?.type || 'unknown',
        platform: 'web'
      }
    });
  }

  /**
   * Handle native notification received
   */
  private static handleNativeNotificationReceived(notification: PushNotificationSchema): void {
    console.log('Handling native notification received:', notification);

    // Show in-app notification if app is active
    this.showInAppNotification({
      title: notification.title || 'New Notification',
      body: notification.body || '',
      data: notification.data
    });

    // Track notification received
    AnalyticsService.trackCustomEvent({
      name: 'notification_received_native',
      parameters: {
        notification_type: notification.data?.type || 'unknown',
        platform: Capacitor.getPlatform()
      }
    });
  }

  /**
   * Handle native notification action
   */
  private static handleNativeNotificationAction(notification: ActionPerformed): void {
    console.log('Handling native notification action:', notification);

    this.handleNotificationClick(notification.notification.data);

    // Track notification action
    AnalyticsService.trackCustomEvent({
      name: 'notification_action_performed',
      parameters: {
        action_id: notification.actionId,
        notification_type: notification.notification.data?.type || 'unknown',
        platform: Capacitor.getPlatform()
      }
    });
  }

  /**
   * Handle local notification action
   */
  private static handleLocalNotificationAction(notification: any): void {
    console.log('Handling local notification action:', notification);

    this.handleNotificationClick(notification.notification.extra);

    // Track local notification action
    AnalyticsService.trackCustomEvent({
      name: 'local_notification_action_performed',
      parameters: {
        action_id: notification.actionId,
        notification_id: notification.notification.id,
        platform: Capacitor.getPlatform()
      }
    });
  }

  /**
   * Handle notification click
   */
  private static handleNotificationClick(data?: Record<string, any>): void {
    if (!data) return;

    // Navigate based on notification data
    const { type, url, quizId, userId } = data;

    switch (type) {
      case 'quiz_reminder':
        if (quizId) {
          window.location.href = `/quiz/${quizId}`;
        }
        break;
      case 'achievement':
        window.location.href = '/profile?tab=achievements';
        break;
      case 'leaderboard':
        window.location.href = '/leaderboards';
        break;
      case 'study_reminder':
        window.location.href = '/study-materials';
        break;
      default:
        if (url) {
          window.location.href = url;
        } else {
          window.location.href = '/';
        }
    }
  }

  /**
   * Show in-app notification
   */
  private static showInAppNotification(notification: NotificationPayload): void {
    // Create and show custom in-app notification UI
    // This can be implemented with a toast/snackbar component
    console.log('Showing in-app notification:', notification);

    // Dispatch custom event for UI components to listen to
    const event = new CustomEvent('inAppNotification', {
      detail: notification
    });
    window.dispatchEvent(event);
  }

  /**
   * Unsubscribe from notifications
   */
  static async unsubscribe(): Promise<void> {
    try {
      if (messaging && this.fcmToken) {
        await deleteToken(messaging);
        this.fcmToken = null;
      }

      if (Capacitor.isNativePlatform()) {
        // Remove all listeners
        await PushNotifications.removeAllListeners();
        await LocalNotifications.removeAllListeners();
      }

      console.log('Unsubscribed from notifications');
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      throw error;
    }
  }

  /**
   * Get current notification settings
   */
  static async getNotificationSettings(): Promise<any> {
    const permission = await this.requestPermission();
    const pendingNotifications = await this.getPendingNotifications();

    return {
      permission,
      fcmToken: this.fcmToken,
      platform: Capacitor.getPlatform(),
      pendingNotifications: pendingNotifications.length,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Test notification
   */
  static async testNotification(): Promise<void> {
    await this.sendLocalNotification({
      title: 'Test Notification',
      body: 'This is a test notification from TestYourself!',
      icon: '/icons/icon-192.webp',
      data: { type: 'test' },
      requireInteraction: false
    });
  }

  /**
   * Create notification templates for common scenarios
   */
  static getNotificationTemplates() {
    return {
      quizReminder: (quizTitle: string, quizId: string): NotificationPayload => ({
        title: 'Time for a Quiz! 📚',
        body: `Ready to test your knowledge with "${quizTitle}"?`,
        icon: '/icons/icon-192.webp',
        data: { type: 'quiz_reminder', quizId },
        actions: [
          { action: 'start_quiz', title: 'Start Quiz' },
          { action: 'remind_later', title: 'Remind Later' }
        ]
      }),

      achievementUnlocked: (achievementName: string): NotificationPayload => ({
        title: 'Achievement Unlocked! 🏆',
        body: `Congratulations! You've earned "${achievementName}"`,
        icon: '/icons/icon-192.webp',
        data: { type: 'achievement' },
        requireInteraction: true
      }),

      studyReminder: (): NotificationPayload => ({
        title: 'Study Time! 📖',
        body: 'Keep up your learning streak! Check out new study materials.',
        icon: '/icons/icon-192.webp',
        data: { type: 'study_reminder' }
      }),

      leaderboardUpdate: (position: number): NotificationPayload => ({
        title: 'Leaderboard Update! 📊',
        body: `You're now #${position} on the leaderboard! Keep it up!`,
        icon: '/icons/icon-192.webp',
        data: { type: 'leaderboard' }
      })
    };
  }
}

export default NotificationService;