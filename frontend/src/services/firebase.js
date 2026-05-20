// Firebase Core
import { initializeApp } from "firebase/app";

/* AUTH */

import { getAuth } from "firebase/auth";

/* FIRESTORE */

import { getFirestore } from "firebase/firestore";

/* OPTIONAL ANALYTICS */

import { getAnalytics } from "firebase/analytics";

/* FIREBASE CONFIG */

const firebaseConfig = {
  apiKey: "AIzaSyB-EaIbxLCo84YIcMWxApKDGZHlNPeDPq8",

  authDomain: "digiattend-8b9af.firebaseapp.com",

  projectId: "digiattend-8b9af",

  storageBucket: "digiattend-8b9af.firebasestorage.app",

  messagingSenderId: "18907549914",

  appId: "1:18907549914:web:724a1b3da1e0fd79a015e3",

  measurementId: "G-9K39ZXX02J",
};

/* INITIALIZE */

const app = initializeApp(firebaseConfig);

/* ANALYTICS */

getAnalytics(app);

/* EXPORT AUTH */

export const auth = getAuth(app);

/* EXPORT DATABASE */

export const db = getFirestore(app);
