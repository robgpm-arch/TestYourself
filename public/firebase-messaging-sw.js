// Firebase Cloud Messaging Service Worker
// This file must be at the root of your site (public directory)

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdf9ABK0vfFN9jYtuKIaP9_HAxnxrFppc",
  authDomain: "testyourself-80a10.firebaseapp.com",
  projectId: "testyourself-80a10",
  storageBucket: "testyourself-80a10.firebasestorage.app",
  messagingSenderId: "1029386064107",
  appId: "1:1029386064107:web:4ea1d501506efa6886aeae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'TestYourself';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icons/icon-192.webp',
    badge: '/icons/icon-96.webp',
    image: payload.notification?.image,
    data: payload.data,
    tag: payload.data?.type || 'general',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-48.webp'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/icon-48.webp'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Handle notification click - open app or specific page
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);
  
  // Track notification dismissal
  if (event.notification.data?.analytics) {
    // Send analytics event for notification dismissal
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: event.notification.data.id,
        type: event.notification.data.type,
        dismissedAt: new Date().toISOString()
      })
    }).catch(console.error);
  }
});

// Handle push event (for additional processing)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
  
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push event data:', data);
    
    // Custom push handling logic can be added here
    // For example, storing notifications in IndexedDB for offline access
  } catch (error) {
    console.error('Error parsing push event data:', error);
  }
});