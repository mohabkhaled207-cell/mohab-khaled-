import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const hasConfig = Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);

const app = hasConfig ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = (app && firebaseConfig.firestoreDatabaseId)
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : (app ? getFirestore(app) : null);

export const firebaseReady = Boolean(app && db);