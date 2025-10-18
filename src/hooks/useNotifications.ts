import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/notificationService';
import { AnalyticsService } from '../services/analyticsService';

export interface NotificationSettings {
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  categories: {
    quizReminders: boolean;
    achievements: boolean;
    studyReminders: boolean;
    leaderboardUpdates: boolean;
    social: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: {
    quizReminders: 'never' | 'daily' | 'weekly';
    studyReminders: 'never' | 'daily' | 'weekly';
  };
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    prompt: true
  });
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    categories: {
      quizReminders: true,
      achievements: true,
      studyReminders: true,
      leaderboardUpdates: true,
      social: true,
      system: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    frequency: {
      quizReminders: 'daily',
      studyReminders: 'daily'
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isInitialized) {
      saveSettings();
    }
  }, [settings, isInitialized]);

  const initializeNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await NotificationService.initialize();
      const currentPermission = await NotificationService.requestPermission();
      setPermission(currentPermission);
      setIsInitialized(true);

      // Track initialization
      AnalyticsService.trackCustomEvent({
        name: 'notifications_initialized',
        parameters: {
          permission_granted: currentPermission.granted,
          platform: navigator.platform
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize notifications';
      setError(errorMessage);
      console.error('Notification initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('notification_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.error('Failed to load notification settings:', err);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save notification settings:', err);
    }
  };

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newPermission = await NotificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission.granted) {
        setSettings(prev => ({ ...prev, pushEnabled: true }));
        
        // Track permission granted
        AnalyticsService.trackCustomEvent({
          name: 'notification_permission_granted',
          parameters: { method: 'manual_request' }
        });
      } else {
        setSettings(prev => ({ ...prev, pushEnabled: false }));
        
        // Track permission denied
        AnalyticsService.trackCustomEvent({
          name: 'notification_permission_denied',
          parameters: { method: 'manual_request' }
        });
      }

      return newPermission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Track settings changes
      AnalyticsService.trackCustomEvent({
        name: 'notification_settings_updated',
        parameters: {
          changes: Object.keys(newSettings),
          push_enabled: updated.pushEnabled
        }
      });

      return updated;
    });
  }, []);

  const toggleCategory = useCallback((category: keyof NotificationSettings['categories']) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));

    // Track category toggle
    AnalyticsService.trackCustomEvent({
      name: 'notification_category_toggled',
      parameters: {
        category,
        enabled: !settings.categories[category]
      }
    });
  }, [settings.categories]);

  const scheduleQuizReminder = useCallback(async (quizId: string, quizTitle: string, reminderTime: Date) => {
    if (!settings.categories.quizReminders || !permission.granted) {
      return;
    }

    try {
      await NotificationService.scheduleNotification({
        id: parseInt(`${Date.now()}${Math.random() * 1000}`),
        title: 'Quiz Reminder 📚',
        body: `Time to take "${quizTitle}"!`,
        schedule: { at: reminderTime },
        data: { type: 'quiz_reminder', quizId }
      });

      // Track scheduled reminder
      AnalyticsService.trackCustomEvent({
        name: 'quiz_reminder_scheduled',
        parameters: {
          quiz_id: quizId,
          reminder_delay_minutes: Math.round((reminderTime.getTime() - Date.now()) / (1000 * 60))
        }
      });
    } catch (err) {
      console.error('Failed to schedule quiz reminder:', err);
      throw err;
    }
  }, [settings.categories.quizReminders, permission.granted]);

  const scheduleStudyReminder = useCallback(async (reminderTime: Date) => {
    if (!settings.categories.studyReminders || !permission.granted) {
      return;
    }

    try {
      await NotificationService.scheduleNotification({
        id: parseInt(`${Date.now()}${Math.random() * 1000}`),
        title: 'Study Time! 📖',
        body: 'Keep up your learning streak! Time to study.',
        schedule: { at: reminderTime, repeats: true },
        data: { type: 'study_reminder' }
      });

      // Track scheduled study reminder
      AnalyticsService.trackCustomEvent({
        name: 'study_reminder_scheduled',
        parameters: {
          frequency: settings.frequency.studyReminders,
          reminder_time: reminderTime.toISOString()
        }
      });
    } catch (err) {
      console.error('Failed to schedule study reminder:', err);
      throw err;
    }
  }, [settings.categories.studyReminders, settings.frequency.studyReminders, permission.granted]);

  const sendAchievementNotification = useCallback(async (achievementName: string) => {
    if (!settings.categories.achievements) {
      return;
    }

    try {
      const template = NotificationService.getNotificationTemplates().achievementUnlocked(achievementName);
      await NotificationService.sendLocalNotification(template);

      // Track achievement notification
      AnalyticsService.trackCustomEvent({
        name: 'achievement_notification_sent',
        parameters: {
          achievement_name: achievementName
        }
      });
    } catch (err) {
      console.error('Failed to send achievement notification:', err);
      throw err;
    }
  }, [settings.categories.achievements]);

  const sendLeaderboardUpdate = useCallback(async (position: number) => {
    if (!settings.categories.leaderboardUpdates) {
      return;
    }

    try {
      const template = NotificationService.getNotificationTemplates().leaderboardUpdate(position);
      await NotificationService.sendLocalNotification(template);

      // Track leaderboard notification
      AnalyticsService.trackCustomEvent({
        name: 'leaderboard_notification_sent',
        parameters: {
          new_position: position
        }
      });
    } catch (err) {
      console.error('Failed to send leaderboard notification:', err);
      throw err;
    }
  }, [settings.categories.leaderboardUpdates]);

  const testNotification = useCallback(async () => {
    try {
      await NotificationService.testNotification();
      
      // Track test notification
      AnalyticsService.trackCustomEvent({
        name: 'test_notification_sent'
      });
    } catch (err) {
      console.error('Failed to send test notification:', err);
      throw err;
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      await NotificationService.clearAllNotifications();
      
      // Track clear all
      AnalyticsService.trackCustomEvent({
        name: 'all_notifications_cleared'
      });
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      throw err;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      await NotificationService.unsubscribe();
      setPermission({ granted: false, denied: true, prompt: false });
      setSettings(prev => ({ ...prev, pushEnabled: false }));
      
      // Track unsubscribe
      AnalyticsService.trackCustomEvent({
        name: 'notifications_unsubscribed'
      });
    } catch (err) {
      console.error('Failed to unsubscribe from notifications:', err);
      throw err;
    }
  }, []);

  const isInQuietHours = useCallback((): boolean => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle quiet hours that span midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }, [settings.quietHours]);

  const getNotificationStatus = useCallback(() => {
    return {
      isInitialized,
      permission,
      settings,
      error,
      isLoading,
      isInQuietHours: isInQuietHours(),
      canReceiveNotifications: permission.granted && settings.pushEnabled
    };
  }, [isInitialized, permission, settings, error, isLoading, isInQuietHours]);

  return {
    // State
    isInitialized,
    permission,
    settings,
    error,
    isLoading,
    
    // Actions
    requestPermission,
    updateSettings,
    toggleCategory,
    scheduleQuizReminder,
    scheduleStudyReminder,
    sendAchievementNotification,
    sendLeaderboardUpdate,
    testNotification,
    clearAllNotifications,
    unsubscribe,
    
    // Utilities
    isInQuietHours,
    getNotificationStatus
  };
};

export default useNotifications;