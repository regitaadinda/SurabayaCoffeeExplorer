import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC3jyA5xLi341VvuwODAdK-VO85Amr2Jaw",
  authDomain: "reactnative2025-1f8cf.firebaseapp.com",
  databaseURL: "https://reactnative2025-1f8cf-default-rtdb.firebaseio.com",
  projectId: "reactnative2025-1f8cf",
  storageBucket: "reactnative2025-1f8cf.firebasestorage.app",
  messagingSenderId: "123914710293",
  appId: "1:123914710293:web:c8d9dfecb93d1afbef8d1c"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getDatabase(app);

export { auth, db };