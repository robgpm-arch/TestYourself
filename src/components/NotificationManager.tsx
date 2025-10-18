import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Settings, Clock, Shield } from 'lucide-react';
import { NotificationService } from '../services/notificationService';
import { AnalyticsService } from '../services/analyticsService';

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'info' | 'warning' | 'error';
  icon?: string;
  data?: Record<string, any>;
  timestamp: number;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

interface NotificationManagerProps {
  className?: string;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [settings, setSettings] = useState({
    pushEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  useEffect(() => {
    initializeNotifications();
    setupEventListeners();

    return () => {
      removeEventListeners();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      await NotificationService.initialize();
      const notificationSettings = await NotificationService.getNotificationSettings();
      setPermissionStatus(notificationSettings.permission.granted ? 'granted' : 'denied');
      setSettings(prev => ({
        ...prev,
        pushEnabled: notificationSettings.permission.granted,
      }));
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const setupEventListeners = () => {
    // Listen for in-app notifications
    window.addEventListener('inAppNotification', handleInAppNotification);

    // Listen for permission changes
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then(permission => {
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
      });
    }
  };

  const removeEventListeners = () => {
    window.removeEventListener('inAppNotification', handleInAppNotification);
  };

  const handleInAppNotification = (event: CustomEvent) => {
    const notificationData = event.detail;
    const newNotification: InAppNotification = {
      id: `notification-${Date.now()}-${Math.random()}`,
      title: notificationData.title,
      body: notificationData.body,
      type: getNotificationType(notificationData.data?.type),
      icon: notificationData.icon,
      data: notificationData.data,
      timestamp: Date.now(),
      read: false,
      actions: getNotificationActions(notificationData.data),
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10 notifications

    // Auto-remove after 5 seconds for non-important notifications
    if (newNotification.type === 'info') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }

    // Track in-app notification display
    AnalyticsService.trackCustomEvent({
      name: 'in_app_notification_displayed',
      parameters: {
        notification_type: notificationData.data?.type || 'unknown',
        notification_title: notificationData.title,
      },
    });
  };

  const getNotificationType = (type: string): InAppNotification['type'] => {
    switch (type) {
      case 'achievement':
      case 'quiz_complete':
        return 'success';
      case 'quiz_reminder':
      case 'study_reminder':
        return 'info';
      case 'error':
      case 'quiz_failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getNotificationActions = (data?: Record<string, any>) => {
    if (!data) return undefined;

    const actions = [];

    switch (data.type) {
      case 'quiz_reminder':
        actions.push({
          label: 'Start Quiz',
          action: () => {
            window.location.href = `/quiz/${data.quizId}`;
            AnalyticsService.trackCustomEvent({
              name: 'notification_action_clicked',
              parameters: { action: 'start_quiz', quiz_id: data.quizId },
            });
          },
          primary: true,
        });
        break;
      case 'achievement':
        actions.push({
          label: 'View Achievement',
          action: () => {
            window.location.href = '/profile?tab=achievements';
            AnalyticsService.trackCustomEvent({
              name: 'notification_action_clicked',
              parameters: { action: 'view_achievement' },
            });
          },
          primary: true,
        });
        break;
      case 'leaderboard':
        actions.push({
          label: 'View Leaderboard',
          action: () => {
            window.location.href = '/leaderboards';
            AnalyticsService.trackCustomEvent({
              name: 'notification_action_clicked',
              parameters: { action: 'view_leaderboard' },
            });
          },
          primary: true,
        });
        break;
    }

    return actions.length > 0 ? actions : undefined;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    AnalyticsService.trackCustomEvent({
      name: 'notifications_cleared',
      parameters: { count: notifications.length },
    });
  };

  const requestPermission = async () => {
    try {
      const permission = await NotificationService.requestPermission();
      setPermissionStatus(permission.granted ? 'granted' : 'denied');
      setSettings(prev => ({ ...prev, pushEnabled: permission.granted }));

      if (permission.granted) {
        AnalyticsService.trackCustomEvent({
          name: 'notification_permission_granted',
        });
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const testNotification = async () => {
    try {
      await NotificationService.testNotification();
      AnalyticsService.trackCustomEvent({
        name: 'test_notification_sent',
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type: InAppNotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Permission Status */}
          {permissionStatus !== 'granted' && (
            <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Enable Push Notifications
                </span>
              </div>
              <p className="text-xs text-yellow-700 mb-2">
                Get notified about quiz reminders, achievements, and important updates.
              </p>
              <button
                onClick={requestPermission}
                className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
              >
                Enable Notifications
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
                {permissionStatus === 'granted' && (
                  <button
                    onClick={testNotification}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Send Test Notification
                  </button>
                )}
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    !notification.read ? getNotificationBgColor(notification.type) : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>

                      {/* Actions */}
                      {notification.actions && (
                        <div className="flex gap-2 mt-2">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                action.action();
                                markAsRead(notification.id);
                              }}
                              className={`text-xs px-2 py-1 rounded ${
                                action.primary
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Settings Link */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to notification settings
                window.location.href = '/settings?tab=notifications';
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
