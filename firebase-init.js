// --- 1. Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyB6qqyalulbk_GEUrAedb2jXT1D0ikdy0E",
    authDomain: "dseu-insiders-8525e.firebaseapp.com",
    projectId: "dseu-insiders-8525e",
    storageBucket: "dseu-insiders-8525e.firebasestorage.app",
    messagingSenderId: "241098088510",
    appId: "1:241098088510:web:d2972a67f36189f6fb716f",
    measurementId: "G-G41VV5FQ1X"
};

// --- 2. Initialize Firebase ---
// Prevent crashing if already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

// --- 3. Initialize Services (Global Variables) ---
// We make these variables global (window.db) so script.js can use them
const auth = firebase.auth();
const db = firebase.firestore();
const messaging = firebase.messaging();

// Expose them to the browser window so other scripts can find them
window.auth = auth;
window.db = db;
window.messaging = messaging;

console.log("Firebase Initialized Successfully");







// --- 4. Notification Logic (Token Fetcher) ---
// This function is called when you click "Enable Notifications"
// --- 4. Notification Logic (Token Fetcher) ---
// --- 4. Notification Logic (Token Fetcher) ---
async function requestNotificationPermission() {
    console.log("Requesting permission...");
    
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            
            // Get the token
            const currentToken = await messaging.getToken({ 
                vapidKey: "YOUR_VAPID_KEY_HERE", // <--- KEEP YOUR REAL KEY HERE
                serviceWorkerRegistration: registration 
            });

            if (currentToken) {
                console.log("Token generated:", currentToken);
                // RETURN the token so script.js knows it worked!
                return currentToken; 
            }
        } else {
            console.log("Permission denied.");
            return null;
        }
    } catch (err) {
        console.log('Error:', err);
        return null;
    }
}
window.requestNotificationPermission = requestNotificationPermission;