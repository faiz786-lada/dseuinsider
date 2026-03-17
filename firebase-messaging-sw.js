importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js');

// 1. Initialize Firebase INSIDE the Service Worker
// (Must match your main config exactly)
firebase.initializeApp({
    apiKey: "AIzaSyB6qqyalulbk_GEUrAedb2jXT1D0ikdy0E",
    projectId: "dseu-insiders-8525e",
    messagingSenderId: "241098088510",
    appId: "1:241098088510:web:d2972a67f36189f6fb716f"
});

// 2. Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// 3. Handle Background Messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/img/logo.png', // Make sure this path exists, or remove this line
    requireInteraction: true // Keeps notification on screen until clicked
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});