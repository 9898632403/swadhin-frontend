// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDqdJpHhXklv-7NuMDA_38aOHrWNBLuc18",
  authDomain: "swadhin-auth.firebaseapp.com",
  projectId: "swadhin-auth",
  storageBucket: "swadhin-auth.appspot.com", // corrected this from your original (firebasestorage.app -> appspot.com)
  messagingSenderId: "21790051175",
  appId: "1:21790051175:web:3430cb80a090cdcb1ffdc2",
  measurementId: "G-C2KKN5CT0J",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
