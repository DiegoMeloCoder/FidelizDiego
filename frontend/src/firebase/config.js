// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Optional: Uncomment if you need Analytics

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgqz5_ddrppHbP_YWXjpnCcioImPFXg0E",
  authDomain: "fidelizdiegov1.firebaseapp.com",
  projectId: "fidelizdiegov1",
  storageBucket: "fidelizdiegov1.firebasestorage.app", // Corrected key name
  messagingSenderId: "884170074487",
  appId: "1:884170074487:web:436bc420b540dd8ad1d972",
  measurementId: "G-QF5EPSTVZ6" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Optional: Uncomment if you need Analytics

// Export the services for use in other parts of the app
export { app, auth, db };
